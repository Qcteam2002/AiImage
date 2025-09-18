# 🚀 AIImage App - Ubuntu Server Deployment Guide

## 📋 Overview
Deploy AIImage application to Ubuntu server with existing app/database without conflicts.

## 🎯 System Requirements
- **OS**: Ubuntu 20.04+ (LTS recommended)
- **Node.js**: v18+ 
- **Docker**: For database services
- **PM2**: For process management
- **Nginx**: For reverse proxy (optional)

## 📁 Project Structure
```
/opt/aiimage/                    # Main app directory
├── backend/                     # Backend API (Port 3001)
├── image-processing-api/        # Image Processing API (Port 3002)  
├── frontend/                    # React Frontend (Port 3000)
├── docker-compose.yml          # Database services
├── ecosystem.config.js         # PM2 configuration
└── nginx.conf                  # Nginx config (optional)
```

## 🔧 Step 1: Server Preparation

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Node.js 18+
```bash
# Install NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be v18+
npm --version
```

### 1.3 Install Docker (if not installed)
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 1.4 Install PM2
```bash
sudo npm install -g pm2
```

## 📦 Step 2: Code Deployment

### 2.1 Create App Directory
```bash
sudo mkdir -p /opt/aiimage
sudo chown $USER:$USER /opt/aiimage
cd /opt/aiimage
```

### 2.2 Upload Code (Choose one method)

#### Method A: Git Clone (Recommended)
```bash
# If you have a Git repository
git clone <your-repo-url> .

# Or upload via SCP/SFTP
# scp -r /path/to/local/aiimage/* user@server:/opt/aiimage/
```

#### Method B: Direct Upload
```bash
# Create tar archive locally
cd /Users/vophuong/Documents/AIImage
tar -czf aiimage.tar.gz --exclude=node_modules --exclude=.git --exclude=uploads .

# Upload to server
scp aiimage.tar.gz user@your-server:/opt/aiimage/

# Extract on server
cd /opt/aiimage
tar -xzf aiimage.tar.gz
rm aiimage.tar.gz
```

### 2.3 Install Dependencies
```bash
# Backend
cd backend
npm install --production
cd ..

# Image Processing API  
cd image-processing-api
npm install --production
cd ..

# Frontend
cd frontend
npm install --production
npm run build
cd ..
```

## 🗄️ Step 3: Database Setup

### 3.1 Configure Docker Compose
```bash
# Edit docker-compose.yml to avoid port conflicts
nano docker-compose.yml
```

**Updated docker-compose.yml:**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: aiimage_postgres
    environment:
      POSTGRES_DB: aiimage
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
    ports:
      - "5442:5432"  # Changed from 5441 to avoid conflicts
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: aiimage_redis
    ports:
      - "6391:6379"  # Changed from 6390 to avoid conflicts
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 3.2 Start Database Services
```bash
# Start only database services
docker-compose up -d postgres redis

# Verify services are running
docker ps
```

### 3.3 Run Database Migrations
```bash
cd backend
npm run migrate
cd ..
```

## ⚙️ Step 4: Environment Configuration

### 4.1 Backend Environment
```bash
cd backend
cp .env.example .env
nano .env
```

**Backend .env:**
```env
# Server
NODE_ENV=production
PORT=3001

# Database (Updated ports)
DB_HOST=localhost
DB_PORT=5442
DB_USER=admin
DB_PASSWORD=admin123
DB_NAME=aiimage

# Redis (Updated ports)
REDIS_HOST=localhost
REDIS_PORT=6391

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email (Configure with your SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URL
FRONTEND_URL=http://your-domain.com

# Image Processing API
IMAGE_PROCESSING_API_URL=http://localhost:3002
```

### 4.2 Image Processing API Environment
```bash
cd image-processing-api
cp .env.example .env
nano .env
```

**Image Processing API .env:**
```env
# Server
NODE_ENV=production
PORT=3002

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key-here

# Upload settings
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp,image/gif
```

### 4.3 Frontend Environment
```bash
cd frontend
cp .env.example .env
nano .env
```

**Frontend .env:**
```env
VITE_API_URL=http://your-domain.com/api
```

## 🚀 Step 5: PM2 Configuration

### 5.1 Create PM2 Ecosystem File
```bash
nano ecosystem.config.js
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [
    {
      name: 'aiimage-backend',
      script: './backend/src/server.ts',
      cwd: '/opt/aiimage',
      interpreter: 'node_modules/.bin/ts-node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'aiimage-image-api',
      script: './image-processing-api/src/server.ts',
      cwd: '/opt/aiimage',
      interpreter: 'node_modules/.bin/ts-node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: './logs/image-api-error.log',
      out_file: './logs/image-api-out.log',
      log_file: './logs/image-api-combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'aiimage-frontend',
      script: 'serve',
      args: '-s frontend/dist -l 3000',
      cwd: '/opt/aiimage',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
```

### 5.2 Install Serve for Frontend
```bash
sudo npm install -g serve
```

### 5.3 Create Logs Directory
```bash
mkdir -p logs
```

### 5.4 Start Applications
```bash
# Start all services
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🌐 Step 6: Nginx Configuration (Optional)

### 6.1 Install Nginx
```bash
sudo apt install nginx -y
```

### 6.2 Create Nginx Config
```bash
sudo nano /etc/nginx/sites-available/aiimage
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeout for image processing
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Image Processing API (internal)
    location /image-api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static {
        alias /opt/aiimage/frontend/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 6.3 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/aiimage /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 Step 7: SSL Certificate (Optional)

### 7.1 Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 7.2 Get SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 📊 Step 8: Monitoring & Maintenance

### 8.1 PM2 Monitoring
```bash
# View real-time monitoring
pm2 monit

# Restart services
pm2 restart all

# Stop services
pm2 stop all

# Delete services
pm2 delete all
```

### 8.2 Log Management
```bash
# View logs
pm2 logs aiimage-backend
pm2 logs aiimage-image-api
pm2 logs aiimage-frontend

# Clear logs
pm2 flush
```

### 8.3 Database Backup
```bash
# Create backup script
nano backup-db.sh
```

**backup-db.sh:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/aiimage/backups"
mkdir -p $BACKUP_DIR

docker exec aiimage_postgres pg_dump -U admin aiimage > $BACKUP_DIR/aiimage_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

```bash
chmod +x backup-db.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /opt/aiimage/backup-db.sh
```

## 🚨 Troubleshooting

### Common Issues:

1. **Port Conflicts**
   ```bash
   # Check what's using ports
   sudo netstat -tulpn | grep :3001
   sudo netstat -tulpn | grep :3002
   sudo netstat -tulpn | grep :5442
   ```

2. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER /opt/aiimage
   chmod +x ecosystem.config.js
   ```

3. **Database Connection Issues**
   ```bash
   # Check database status
   docker ps
   docker logs aiimage_postgres
   ```

4. **PM2 Issues**
   ```bash
   # Reset PM2
   pm2 kill
   pm2 start ecosystem.config.js
   ```

## 📋 Deployment Checklist

- [ ] Server prepared (Node.js, Docker, PM2)
- [ ] Code uploaded to `/opt/aiimage`
- [ ] Dependencies installed
- [ ] Database services running (ports 5442, 6391)
- [ ] Environment files configured
- [ ] Database migrations run
- [ ] PM2 services started
- [ ] Nginx configured (optional)
- [ ] SSL certificate installed (optional)
- [ ] Monitoring setup
- [ ] Backup script configured

## 🎯 Final Verification

1. **Check Services:**
   ```bash
   pm2 status
   docker ps
   ```

2. **Test Endpoints:**
   - Frontend: `http://your-domain.com`
   - Backend API: `http://your-domain.com/api/auth/profile`
   - Image Processing: Internal only

3. **Test Features:**
   - User registration/login
   - Image upload & processing
   - Product Image Tools
   - Download functionality

## 📞 Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs`
2. Check Docker logs: `docker logs aiimage_postgres`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Verify environment variables
5. Check port conflicts

---

**🎉 Deployment Complete!** Your AIImage app is now running on Ubuntu server with Product Image Tools feature!

