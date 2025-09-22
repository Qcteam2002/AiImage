#!/bin/bash

# AI Image App Deployment Script
# Usage: ./deploy.sh [server_ip] [domain]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
SERVER_IP=""
DOMAIN="tikminer.info"
SSH_USER="root"
APP_DIR="/home/app/ai-image"

# Parse arguments
if [ $# -lt 1 ]; then
    echo -e "${RED}Usage: $0 <server_ip> [domain]${NC}"
    echo "Example: $0 192.168.1.100 tikminer.info"
    exit 1
fi

SERVER_IP=$1
if [ $# -ge 2 ]; then
    DOMAIN=$2
fi

echo -e "${BLUE}🚀 Starting deployment to $SERVER_IP with domain $DOMAIN${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we can connect to server
echo -e "${BLUE}🔍 Checking server connection...${NC}"
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes $SSH_USER@$SERVER_IP exit 2>/dev/null; then
    print_error "Cannot connect to server $SERVER_IP"
    print_warning "Make sure SSH key is configured or use: ssh-copy-id $SSH_USER@$SERVER_IP"
    exit 1
fi
print_status "Server connection successful"

# Create deployment package
echo -e "${BLUE}📦 Creating deployment package...${NC}"

# Create temp directory
TEMP_DIR=$(mktemp -d)
echo "Using temp directory: $TEMP_DIR"

# Copy application files
cp -r . $TEMP_DIR/ai-image/
cd $TEMP_DIR/ai-image

# Remove unnecessary files
rm -rf node_modules
rm -rf .git
rm -rf .env
rm -rf backend/.env
rm -rf frontend/.env
rm -rf frontend/dist
rm -rf backend/dist
rm -rf backend/uploads
rm -rf *.log

# Create production environment files
echo -e "${BLUE}⚙️  Creating production configuration...${NC}"

# Backend .env
cat > backend/.env << EOF
# Server Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database Configuration
DATABASE_URL=file:./prisma/prod.db

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 64)
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/home/app/ai-image/uploads
TEMP_PATH=/home/app/ai-image/uploads/temp
GENERATED_PATH=/home/app/ai-image/uploads/generated

# AI Services Configuration (UPDATE THESE!)
GEMINI_API_KEY=your-gemini-api-key-here
OPENROUTER_API_KEY=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
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# CORS Configuration
CORS_ORIGINS=https://$DOMAIN,https://api.$DOMAIN

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_SECRET=$(openssl rand -base64 64)
COOKIE_SAME_SITE=lax

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=combined

# External URLs
FRONTEND_URL=https://$DOMAIN
API_URL=https://api.$DOMAIN
SITE_URL=https://$DOMAIN
SITE_NAME=AI Image Analysis
EOF

# Frontend .env.production
cat > frontend/.env.production << EOF
VITE_API_URL=https://api.$DOMAIN
VITE_APP_NAME=AI Image Analysis
VITE_APP_VERSION=1.0.0
EOF

# Create ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'ai-image-backend',
      script: 'dist/server.js',
      cwd: '/home/app/ai-image/backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/home/app/ai-image/logs/backend-error.log',
      out_file: '/home/app/ai-image/logs/backend-out.log',
      log_file: '/home/app/ai-image/logs/backend-combined.log',
      time: true,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
EOF

# Create Nginx configuration
mkdir -p nginx-configs

# Main domain config
cat > nginx-configs/tikminer.info << EOF
# Frontend - $DOMAIN
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    root /home/app/ai-image/frontend/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Handle client-side routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# API subdomain config
cat > nginx-configs/api.tikminer.info << EOF
# Backend API - api.$DOMAIN
server {
    listen 80;
    server_name api.$DOMAIN;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # CORS headers
    add_header Access-Control-Allow-Origin "https://$DOMAIN" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
    add_header Access-Control-Allow-Credentials "true" always;
    
    # Handle preflight requests
    if (\$request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin "https://$DOMAIN";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
        add_header Access-Control-Allow-Credentials "true";
        add_header Access-Control-Max-Age 1728000;
        add_header Content-Type "text/plain; charset=utf-8";
        add_header Content-Length 0;
        return 204;
    }
    
    # Proxy to backend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Serve uploaded files
    location /generated/ {
        alias /home/app/ai-image/uploads/generated/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Create setup script for server
cat > setup-server.sh << 'EOF'
#!/bin/bash
set -e

echo "🔧 Setting up server environment..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
sudo apt install nginx -y

# Install PM2 globally
sudo npm install -g pm2

# Install Git
sudo apt install git -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y

# Create app user if not exists
if ! id "app" &>/dev/null; then
    sudo adduser --disabled-password --gecos "" app
    sudo usermod -aG sudo app
fi

# Create directories
sudo mkdir -p /home/app/ai-image
sudo mkdir -p /home/app/ai-image/logs
sudo mkdir -p /home/app/ai-image/uploads/{temp,generated}

# Set permissions
sudo chown -R app:app /home/app/ai-image
chmod -R 755 /home/app/ai-image/uploads

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo "✅ Server setup completed!"
EOF

chmod +x setup-server.sh

print_status "Deployment package created"

# Upload to server
echo -e "${BLUE}📤 Uploading files to server...${NC}"
rsync -avz --delete $TEMP_DIR/ai-image/ $SSH_USER@$SERVER_IP:$APP_DIR/

print_status "Files uploaded successfully"

# Run setup on server
echo -e "${BLUE}🔧 Running server setup...${NC}"
ssh $SSH_USER@$SERVER_IP "cd $APP_DIR && chmod +x setup-server.sh && ./setup-server.sh"

# Install dependencies and build
echo -e "${BLUE}📦 Installing dependencies and building...${NC}"
ssh $SSH_USER@$SERVER_IP "cd $APP_DIR/backend && npm install --production"
ssh $SSH_USER@$SERVER_IP "cd $APP_DIR/frontend && npm install && npm run build"

# Setup database
echo -e "${BLUE}🗄️  Setting up database...${NC}"
ssh $SSH_USER@$SERVER_IP "cd $APP_DIR/backend && npx prisma generate && npx prisma db push"

# Configure Nginx
echo -e "${BLUE}🌐 Configuring Nginx...${NC}"
ssh $SSH_USER@$SERVER_IP "sudo cp $APP_DIR/nginx-configs/tikminer.info /etc/nginx/sites-available/"
ssh $SSH_USER@$SERVER_IP "sudo cp $APP_DIR/nginx-configs/api.tikminer.info /etc/nginx/sites-available/"
ssh $SSH_USER@$SERVER_IP "sudo ln -sf /etc/nginx/sites-available/tikminer.info /etc/nginx/sites-enabled/"
ssh $SSH_USER@$SERVER_IP "sudo ln -sf /etc/nginx/sites-available/api.tikminer.info /etc/nginx/sites-enabled/"
ssh $SSH_USER@$SERVER_IP "sudo nginx -t && sudo systemctl reload nginx"

# Start application
echo -e "${BLUE}🚀 Starting application...${NC}"
ssh $SSH_USER@$SERVER_IP "cd $APP_DIR && pm2 start ecosystem.config.js && pm2 save && pm2 startup"

# Setup SSL (interactive)
echo -e "${YELLOW}🔒 Setting up SSL certificates...${NC}"
echo "This step requires manual intervention. Please run:"
echo "ssh $SSH_USER@$SERVER_IP"
echo "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo "sudo certbot --nginx -d api.$DOMAIN"

# Cleanup
rm -rf $TEMP_DIR

print_status "Deployment completed!"
echo -e "${GREEN}🎉 Your app is now deployed at: https://$DOMAIN${NC}"
echo -e "${GREEN}🔗 API endpoint: https://api.$DOMAIN${NC}"
echo ""
echo -e "${YELLOW}⚠️  Don't forget to:${NC}"
echo "1. Update API keys in backend/.env"
echo "2. Setup SSL certificates"
echo "3. Configure domain DNS to point to $SERVER_IP"
echo "4. Test the application"
echo ""
echo -e "${BLUE}📋 Useful commands:${NC}"
echo "Check status: ssh $SSH_USER@$SERVER_IP 'pm2 status'"
echo "View logs: ssh $SSH_USER@$SERVER_IP 'pm2 logs ai-image-backend'"
echo "Restart app: ssh $SSH_USER@$SERVER_IP 'pm2 restart ai-image-backend'"
