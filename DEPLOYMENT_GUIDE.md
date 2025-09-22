# Hướng dẫn Deploy AI Image App lên Server Ubuntu

## 📋 Tổng quan
Hướng dẫn deploy ứng dụng AI Image lên server Ubuntu với domain `tikminer.info` sử dụng:
- **Frontend**: React + Vite (Port 3000)
- **Backend**: Node.js + Express (Port 3001)
- **Database**: SQLite (có thể nâng cấp PostgreSQL sau)
- **Web Server**: Nginx (Reverse Proxy)
- **Process Manager**: PM2
- **SSL**: Let's Encrypt (Certbot)

## 🖥️ Yêu cầu Server

### Minimum Requirements
- **OS**: Ubuntu 20.04+ (khuyến nghị 22.04 LTS)
- **RAM**: 2GB+ (khuyến nghị 4GB)
- **Storage**: 20GB+ SSD
- **CPU**: 2 cores+
- **Network**: Public IP với domain trỏ về

### Domain Setup
- Domain: `tikminer.info`
- Subdomain: `api.tikminer.info` (cho backend)
- Subdomain: `admin.tikminer.info` (cho admin panel - tùy chọn)

## 🚀 Bước 1: Chuẩn bị Server

### 1.1 Cập nhật hệ thống
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Cài đặt các package cần thiết
```bash
# Cài đặt Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cài đặt Nginx
sudo apt install nginx -y

# Cài đặt PM2 globally
sudo npm install -g pm2

# Cài đặt Git
sudo apt install git -y

# Cài đặt Certbot cho SSL
sudo apt install certbot python3-certbot-nginx -y
```

### 1.3 Tạo user cho ứng dụng
```bash
# Tạo user app
sudo adduser --disabled-password --gecos "" app
sudo usermod -aG sudo app

# Chuyển sang user app
sudo su - app
```

## 🏗️ Bước 2: Deploy Code

### 2.1 Clone repository
```bash
# Tạo thư mục cho app
mkdir -p /home/app/ai-image
cd /home/app/ai-image

# Clone code (thay YOUR_REPO_URL bằng repo thực tế)
git clone https://github.com/your-username/ai-image.git .

# Hoặc upload code qua SCP/SFTP
# scp -r ./AIImage/* user@server:/home/app/ai-image/
```

### 2.2 Cài đặt dependencies

#### Backend
```bash
cd /home/app/ai-image/backend
npm install --production
```

#### Frontend
```bash
cd /home/app/ai-image/frontend
npm install
npm run build
```

## ⚙️ Bước 3: Cấu hình Backend

### 3.1 Tạo file .env cho production
```bash
cd /home/app/ai-image/backend
nano .env
```

Nội dung file `.env`:
```env
# Server Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database Configuration
DATABASE_URL=file:./prisma/prod.db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-very-long-and-random
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration (tùy chọn)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@tikminer.info

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/home/app/ai-image/uploads
TEMP_PATH=/home/app/ai-image/uploads/temp
GENERATED_PATH=/home/app/ai-image/uploads/generated

# AI Services Configuration
GEMINI_API_KEY=your-gemini-api-key
OPENROUTER_API_KEY=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
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# CORS Configuration
CORS_ORIGINS=https://tikminer.info,https://api.tikminer.info

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-very-long-and-random
COOKIE_SAME_SITE=lax

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=combined

# External URLs
FRONTEND_URL=https://tikminer.info
API_URL=https://api.tikminer.info
SITE_URL=https://tikminer.info
SITE_NAME=AI Image Analysis
```

### 3.2 Tạo thư mục uploads
```bash
mkdir -p /home/app/ai-image/uploads/{temp,generated}
chmod 755 /home/app/ai-image/uploads
```

### 3.3 Build và migrate database
```bash
cd /home/app/ai-image/backend
npx prisma generate
npx prisma db push
```

### 3.4 Tạo PM2 ecosystem file
```bash
nano /home/app/ai-image/ecosystem.config.js
```

Nội dung file `ecosystem.config.js`:
```javascript
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
```

### 3.5 Build backend
```bash
cd /home/app/ai-image/backend
npm run build
```

## 🌐 Bước 4: Cấu hình Frontend

### 4.1 Tạo file .env cho production
```bash
cd /home/app/ai-image/frontend
nano .env.production
```

Nội dung file `.env.production`:
```env
VITE_API_URL=https://api.tikminer.info
VITE_APP_NAME=AI Image Analysis
VITE_APP_VERSION=1.0.0
```

### 4.2 Build frontend
```bash
cd /home/app/ai-image/frontend
npm run build
```

## 🔧 Bước 5: Cấu hình Nginx

### 5.1 Tạo cấu hình cho domain chính
```bash
sudo nano /etc/nginx/sites-available/tikminer.info
```

Nội dung file:
```nginx
# Frontend - tikminer.info
server {
    listen 80;
    server_name tikminer.info www.tikminer.info;
    
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
        try_files $uri $uri/ /index.html;
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
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5.2 Tạo cấu hình cho API subdomain
```bash
sudo nano /etc/nginx/sites-available/api.tikminer.info
```

Nội dung file:
```nginx
# Backend API - api.tikminer.info
server {
    listen 80;
    server_name api.tikminer.info;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # CORS headers
    add_header Access-Control-Allow-Origin "https://tikminer.info" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
    add_header Access-Control-Allow-Credentials "true" always;
    
    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin "https://tikminer.info";
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
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
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
```

### 5.3 Enable sites
```bash
sudo ln -s /etc/nginx/sites-available/tikminer.info /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.tikminer.info /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Bước 6: Cấu hình SSL với Let's Encrypt

### 6.1 Cài đặt SSL certificate
```bash
# Cài đặt cho domain chính
sudo certbot --nginx -d tikminer.info -d www.tikminer.info

# Cài đặt cho API subdomain
sudo certbot --nginx -d api.tikminer.info
```

### 6.2 Cấu hình auto-renewal
```bash
sudo crontab -e
```

Thêm dòng:
```cron
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🚀 Bước 7: Khởi động ứng dụng

### 7.1 Tạo thư mục logs
```bash
mkdir -p /home/app/ai-image/logs
```

### 7.2 Khởi động backend với PM2
```bash
cd /home/app/ai-image
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 7.3 Kiểm tra trạng thái
```bash
pm2 status
pm2 logs ai-image-backend
```

## 🔧 Bước 8: Cấu hình Firewall

### 8.1 Cấu hình UFW
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 📊 Bước 9: Monitoring và Logs

### 9.1 Cấu hình log rotation
```bash
sudo nano /etc/logrotate.d/ai-image
```

Nội dung:
```
/home/app/ai-image/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 app app
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 9.2 Cấu hình monitoring
```bash
# Cài đặt htop cho monitoring
sudo apt install htop -y

# Cài đặt PM2 monitoring (tùy chọn)
pm2 install pm2-logrotate
```

## 🔄 Bước 10: Cập nhật và Backup

### 10.1 Script cập nhật
```bash
nano /home/app/ai-image/update.sh
```

Nội dung:
```bash
#!/bin/bash
echo "Updating AI Image App..."

# Pull latest code
cd /home/app/ai-image
git pull origin main

# Update backend
cd backend
npm install --production
npm run build
npx prisma generate
npx prisma db push

# Update frontend
cd ../frontend
npm install
npm run build

# Restart services
pm2 restart ai-image-backend

echo "Update completed!"
```

```bash
chmod +x /home/app/ai-image/update.sh
```

### 10.2 Script backup
```bash
nano /home/app/ai-image/backup.sh
```

Nội dung:
```bash
#!/bin/bash
BACKUP_DIR="/home/app/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp /home/app/ai-image/backend/prisma/prod.db $BACKUP_DIR/database_$DATE.db

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /home/app/ai-image/uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
chmod +x /home/app/ai-image/backup.sh
```

## 🧪 Bước 11: Testing

### 11.1 Kiểm tra các endpoint
```bash
# Frontend
curl -I https://tikminer.info

# API Health
curl https://api.tikminer.info/health

# API Products (cần token)
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.tikminer.info/api/products
```

### 11.2 Kiểm tra SSL
```bash
# Kiểm tra SSL certificate
openssl s_client -connect tikminer.info:443 -servername tikminer.info
```

## 🚨 Troubleshooting

### Lỗi thường gặp:

1. **502 Bad Gateway**
   ```bash
   # Kiểm tra PM2 status
   pm2 status
   pm2 logs ai-image-backend
   
   # Kiểm tra Nginx config
   sudo nginx -t
   ```

2. **Database connection error**
   ```bash
   # Kiểm tra database file
   ls -la /home/app/ai-image/backend/prisma/
   
   # Reset database nếu cần
   cd /home/app/ai-image/backend
   npx prisma db push
   ```

3. **Permission denied**
   ```bash
   # Fix permissions
   sudo chown -R app:app /home/app/ai-image
   chmod -R 755 /home/app/ai-image/uploads
   ```

4. **SSL certificate issues**
   ```bash
   # Renew certificate
   sudo certbot renew --dry-run
   sudo certbot renew
   ```

## 📈 Performance Optimization

### 1. Nginx optimization
```bash
sudo nano /etc/nginx/nginx.conf
```

Thêm vào `http` block:
```nginx
# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied any;
gzip_comp_level 6;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/json
    application/javascript
    application/xml+rss
    application/atom+xml
    image/svg+xml;

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
```

### 2. PM2 cluster mode (cho production lớn)
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'ai-image-backend',
    script: 'dist/server.js',
    instances: 'max', // Sử dụng tất cả CPU cores
    exec_mode: 'cluster',
    // ... other configs
  }]
};
```

## 🔐 Security Checklist

- [ ] Firewall configured (UFW)
- [ ] SSL certificates installed
- [ ] Strong JWT secrets
- [ ] Database permissions set
- [ ] File upload restrictions
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Regular backups scheduled
- [ ] Log monitoring setup
- [ ] Updates automated

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. PM2 logs: `pm2 logs ai-image-backend`
2. Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. System logs: `sudo journalctl -u nginx`
4. Disk space: `df -h`
5. Memory usage: `free -h`

---

**Lưu ý**: Thay thế tất cả placeholder values (API keys, secrets, etc.) bằng giá trị thực tế trước khi deploy production!