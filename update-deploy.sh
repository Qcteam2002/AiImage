#!/bin/bash

# Quick Update Script for AI Image App
# Usage: ./update-deploy.sh [server_ip] [domain]

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

echo -e "${BLUE}🔄 Updating AI Image App on $SERVER_IP${NC}"

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
    exit 1
fi
print_status "Server connection successful"

# Create update package
echo -e "${BLUE}📦 Creating update package...${NC}"

# Create temp directory
TEMP_DIR=$(mktemp -d)
echo "Using temp directory: $TEMP_DIR"

# Copy application files (excluding node_modules, .git, etc.)
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='.env*' --exclude='dist' --exclude='uploads' --exclude='*.log' . $TEMP_DIR/ai-image/

cd $TEMP_DIR/ai-image

# Update frontend .env.production
cat > frontend/.env.production << EOF
VITE_API_URL=https://api.$DOMAIN
VITE_APP_NAME=AI Image Analysis
VITE_APP_VERSION=1.0.0
EOF

# Update ecosystem.config.js
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

print_status "Update package created"

# Upload to server
echo -e "${BLUE}📤 Uploading files to server...${NC}"
rsync -avz --delete $TEMP_DIR/ai-image/ $SSH_USER@$SERVER_IP:$APP_DIR/

print_status "Files uploaded successfully"

# Run update on server
echo -e "${BLUE}🔄 Running update on server...${NC}"

# Stop the application
ssh $SSH_USER@$SERVER_IP "cd $APP_DIR && pm2 stop ai-image-backend || true"

# Update backend
echo -e "${BLUE}📦 Updating backend...${NC}"
ssh $SSH_USER@$SERVER_IP "cd $APP_DIR/backend && npm install --production && npm run build && npx prisma generate"

# Update frontend
echo -e "${BLUE}🎨 Updating frontend...${NC}"
ssh $SSH_USER@$SERVER_IP "cd $APP_DIR/frontend && npm install && npm run build"

# Start the application
echo -e "${BLUE}🚀 Starting application...${NC}"
ssh $SSH_USER@$SERVER_IP "cd $APP_DIR && pm2 start ecosystem.config.js && pm2 save"

# Check status
echo -e "${BLUE}📊 Checking application status...${NC}"
ssh $SSH_USER@$SERVER_IP "pm2 status"

# Cleanup
rm -rf $TEMP_DIR

print_status "Update completed!"
echo -e "${GREEN}🎉 Your app has been updated at: https://$DOMAIN${NC}"
echo ""
echo -e "${BLUE}📋 Useful commands:${NC}"
echo "Check status: ssh $SSH_USER@$SERVER_IP 'pm2 status'"
echo "View logs: ssh $SSH_USER@$SERVER_IP 'pm2 logs ai-image-backend'"
echo "Restart app: ssh $SSH_USER@$SERVER_IP 'pm2 restart ai-image-backend'"
