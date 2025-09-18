# Ubuntu Server Deployment Guide

## Overview
This guide will help you deploy the AI Image Processing application to an Ubuntu server. The application consists of three main services:
- **Backend API** (Port 3001)
- **Image Processing API** (Port 3002) 
- **Frontend** (Port 3000)
- **PostgreSQL Database** (Port 5432)
- **Redis** (Port 6379)

## Prerequisites

### Server Requirements
- Ubuntu 20.04 LTS or later
- Minimum 4GB RAM (8GB recommended)
- Minimum 20GB storage
- Root or sudo access

### Software Requirements
- Node.js 18+ 
- npm 8+
- Docker & Docker Compose
- PM2 (Process Manager)
- Nginx (Reverse Proxy)
- Git

## Step 1: Server Setup

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Required Software
```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

### Start Services
```bash
# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 2: Application Deployment

### Clone Repository
```bash
cd /opt
sudo git clone https://github.com/your-username/ai-image-app.git
sudo chown -R $USER:$USER /opt/ai-image-app
cd /opt/ai-image-app
```

### Install Dependencies
```bash
# Backend
cd backend
npm install

# Image Processing API
cd ../image-processing-api
npm install

# Frontend
cd ../frontend
npm install
```

## Step 3: Environment Configuration

### Backend Environment (.env)
```bash
cd /opt/ai-image-app/backend
nano .env
```

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aiimage_db
DB_USER=aiimage_user
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Email (Optional - for production)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://your-domain.com

# Node Environment
NODE_ENV=production
PORT=3001
```

### Image Processing API Environment (.env)
```bash
cd /opt/ai-image-app/image-processing-api
nano .env
```

```env
# OpenRouter API
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Site Configuration
SITE_URL=https://your-domain.com
SITE_NAME=AI Image App

# Node Environment
NODE_ENV=production
PORT=3002
```

### Frontend Environment (.env)
```bash
cd /opt/ai-image-app/frontend
nano .env
```

```env
VITE_API_URL=http://localhost:3001
VITE_IMAGE_API_URL=http://localhost:3002
```

## Step 4: Database Setup

### Start PostgreSQL with Docker
```bash
cd /opt/ai-image-app
nano docker-compose.yml
```

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: aiimage_postgres
    environment:
      POSTGRES_DB: aiimage_db
      POSTGRES_USER: aiimage_user
      POSTGRES_PASSWORD: your_secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: aiimage_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Start Database Services
```bash
docker-compose up -d
```

### Run Database Migrations
```bash
cd /opt/ai-image-app/backend
npm run migrate
```

## Step 5: Build Applications

### Build Frontend
```bash
cd /opt/ai-image-app/frontend
npm run build
```

### Build Backend & Image Processing API
```bash
# Backend
cd /opt/ai-image-app/backend
npm run build

# Image Processing API
cd /opt/ai-image-app/image-processing-api
npm run build
```

## Step 6: PM2 Configuration

### Create PM2 Ecosystem File
```bash
cd /opt/ai-image-app
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'aiimage-backend',
      script: './backend/dist/server.js',
      cwd: '/opt/ai-image-app',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'aiimage-image-api',
      script: './image-processing-api/dist/server.js',
      cwd: '/opt/ai-image-app',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: './logs/image-api-error.log',
      out_file: './logs/image-api-out.log',
      log_file: './logs/image-api-combined.log',
      time: true
    },
    {
      name: 'aiimage-frontend',
      script: 'serve',
      args: '-s frontend/dist -l 3000',
      cwd: '/opt/ai-image-app',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
};
```

### Install PM2 Dependencies
```bash
npm install -g serve
```

### Create Logs Directory
```bash
mkdir -p /opt/ai-image-app/logs
```

### Start Applications with PM2
```bash
cd /opt/ai-image-app
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Step 7: Nginx Configuration

### Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/aiimage-app
```

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
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Image Processing API
    location /api/tryon {
        proxy_pass http://localhost:3002;
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

    # Health check
    location /health {
        proxy_pass http://localhost:3002/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /generated/ {
        proxy_pass http://localhost:3002/generated/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # File upload size limit
    client_max_body_size 20M;
}
```

### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/aiimage-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 8: SSL Certificate (Optional but Recommended)

### Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Get SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Step 9: Firewall Configuration

### Configure UFW
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 3001
sudo ufw allow 3002
sudo ufw --force enable
```

## Step 10: Monitoring and Maintenance

### PM2 Commands
```bash
# Check status
pm2 status

# View logs
pm2 logs

# Restart all apps
pm2 restart all

# Stop all apps
pm2 stop all

# Monitor
pm2 monit
```

### Log Management
```bash
# View logs
tail -f /opt/ai-image-app/logs/backend-error.log
tail -f /opt/ai-image-app/logs/image-api-error.log
tail -f /opt/ai-image-app/logs/frontend-error.log

# Rotate logs
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Database Backup
```bash
# Create backup script
nano /opt/ai-image-app/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/ai-image-app/backups"
mkdir -p $BACKUP_DIR

docker exec aiimage_postgres pg_dump -U aiimage_user aiimage_db > $BACKUP_DIR/aiimage_db_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

```bash
chmod +x /opt/ai-image-app/backup-db.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /opt/ai-image-app/backup-db.sh
```

## Step 11: Health Checks

### Create Health Check Script
```bash
nano /opt/ai-image-app/health-check.sh
```

```bash
#!/bin/bash

# Check if services are running
pm2 status | grep -q "online" || exit 1

# Check if ports are listening
netstat -tlnp | grep -q ":3000 " || exit 1
netstat -tlnp | grep -q ":3001 " || exit 1
netstat -tlnp | grep -q ":3002 " || exit 1

# Check database
docker exec aiimage_postgres pg_isready -U aiimage_user || exit 1

# Check Redis
docker exec aiimage_redis redis-cli ping | grep -q "PONG" || exit 1

echo "All services are healthy"
exit 0
```

```bash
chmod +x /opt/ai-image-app/health-check.sh
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Database Connection Issues**
   ```bash
   docker logs aiimage_postgres
   docker restart aiimage_postgres
   ```

3. **PM2 Apps Not Starting**
   ```bash
   pm2 logs aiimage-backend
   pm2 restart aiimage-backend
   ```

4. **Nginx Configuration Issues**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

### Performance Optimization

1. **Increase Node.js Memory Limit**
   ```bash
   pm2 start ecosystem.config.js --node-args="--max-old-space-size=4096"
   ```

2. **Database Optimization**
   ```bash
   # Add to postgresql.conf
   shared_buffers = 256MB
   effective_cache_size = 1GB
   maintenance_work_mem = 64MB
   ```

3. **Nginx Caching**
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

## Security Considerations

1. **Change Default Passwords**
   - Database password
   - JWT secret
   - API keys

2. **Regular Updates**
   ```bash
   sudo apt update && sudo apt upgrade -y
   npm audit fix
   ```

3. **Firewall Rules**
   ```bash
   sudo ufw status
   sudo ufw deny 3000
   sudo ufw deny 3001
   sudo ufw deny 3002
   ```

4. **File Permissions**
   ```bash
   chmod 600 /opt/ai-image-app/backend/.env
   chmod 600 /opt/ai-image-app/image-processing-api/.env
   ```

## Backup and Recovery

### Full System Backup
```bash
# Create backup script
nano /opt/ai-image-app/full-backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/aiimage-app-$DATE"

mkdir -p $BACKUP_DIR

# Backup application files
cp -r /opt/ai-image-app $BACKUP_DIR/

# Backup database
docker exec aiimage_postgres pg_dump -U aiimage_user aiimage_db > $BACKUP_DIR/database.sql

# Backup nginx config
cp /etc/nginx/sites-available/aiimage-app $BACKUP_DIR/

# Create archive
tar -czf /opt/backups/aiimage-app-$DATE.tar.gz -C /opt/backups aiimage-app-$DATE
rm -rf $BACKUP_DIR

echo "Backup completed: /opt/backups/aiimage-app-$DATE.tar.gz"
```

## Conclusion

Your AI Image Processing application should now be running on Ubuntu server with:
- ✅ Backend API on port 3001
- ✅ Image Processing API on port 3002  
- ✅ Frontend on port 3000
- ✅ PostgreSQL database
- ✅ Redis cache
- ✅ Nginx reverse proxy
- ✅ PM2 process management
- ✅ SSL certificate (if configured)
- ✅ Monitoring and logging
- ✅ Backup system

Access your application at: `http://your-domain.com` or `https://your-domain.com` (if SSL is configured)
