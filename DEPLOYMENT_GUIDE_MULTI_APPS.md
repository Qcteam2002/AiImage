# Hướng dẫn Deploy Multi-Apps trên Server Ubuntu

## 📋 Tình huống hiện tại
- **Server đã có**: App cũ chạy trên `printzy.info` (port 80/443)
- **App mới**: AI Image App chạy trên `tikminer.info`
- **Mục tiêu**: Chạy cả 2 app cùng lúc không bị conflict

## 🎯 Giải pháp: Nginx Virtual Hosts

### Phương án 1: Sử dụng Nginx Virtual Hosts (Khuyến nghị)

#### Bước 1: Kiểm tra cấu hình hiện tại
```bash
# Kiểm tra Nginx config hiện tại
sudo nginx -t
sudo ls -la /etc/nginx/sites-enabled/
sudo cat /etc/nginx/sites-enabled/default
```

#### Bước 2: Backup cấu hình hiện tại
```bash
# Backup config hiện tại
sudo cp -r /etc/nginx/sites-available /etc/nginx/sites-available.backup
sudo cp -r /etc/nginx/sites-enabled /etc/nginx/sites-enabled.backup
```

#### Bước 3: Tạo cấu hình cho app mới
```bash
# Tạo config cho tikminer.info
sudo nano /etc/nginx/sites-available/tikminer.info
```

Nội dung file `/etc/nginx/sites-available/tikminer.info`:
```nginx
# AI Image App - tikminer.info
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
    
    # API proxy to AI Image backend (port 3001)
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

#### Bước 4: Tạo cấu hình cho API subdomain
```bash
sudo nano /etc/nginx/sites-available/api.tikminer.info
```

Nội dung file `/etc/nginx/sites-available/api.tikminer.info`:
```nginx
# AI Image API - api.tikminer.info
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
    
    # Proxy to AI Image backend
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

#### Bước 5: Enable sites mới
```bash
# Enable sites mới
sudo ln -s /etc/nginx/sites-available/tikminer.info /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.tikminer.info /etc/nginx/sites-enabled/

# Test cấu hình
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### Bước 6: Cài đặt SSL cho domain mới
```bash
# Cài đặt SSL cho tikminer.info
sudo certbot --nginx -d tikminer.info -d www.tikminer.info

# Cài đặt SSL cho API subdomain
sudo certbot --nginx -d api.tikminer.info
```

---

## 🔧 Phương án 2: Sử dụng Port khác nhau

### Nếu muốn chạy app mới trên port khác:

#### Cấu hình Nginx cho port 8080:
```nginx
# AI Image App - tikminer.info:8080
server {
    listen 8080;
    server_name tikminer.info www.tikminer.info;
    
    root /home/app/ai-image/frontend/dist;
    index index.html;
    
    # ... rest of config same as above
}
```

#### Cấu hình backend trên port 3001:
```bash
# Backend sẽ chạy trên port 3001 (không conflict)
# Frontend sẽ chạy trên port 8080
```

---

## 🐳 Phương án 3: Sử dụng Docker (Tách biệt hoàn toàn)

### Tạo docker-compose cho app mới:
```yaml
version: '3.8'
services:
  ai-image-backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    volumes:
      - ./uploads:/app/uploads

  ai-image-frontend:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./frontend/dist:/usr/share/nginx/html
      - ./nginx/ai-image.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - ai-image-backend
```

---

## 📋 Script Deploy cho Multi-Apps

Tôi sẽ tạo script đặc biệt cho trường hợp này:

```bash
#!/bin/bash
# deploy-multi-apps.sh

set -e

SERVER_IP=$1
DOMAIN="tikminer.info"
SSH_USER="root"
APP_DIR="/home/app/ai-image"

echo "🚀 Deploying AI Image App alongside existing app..."

# Upload files
rsync -avz --exclude='node_modules' --exclude='.git' . $SSH_USER@$SERVER_IP:$APP_DIR/

# Install and build
ssh $SSH_USER@$SERVER_IP "cd $APP_DIR/backend && npm install --production && npm run build"
ssh $SSH_USER@$SERVER_IP "cd $APP_DIR/frontend && npm install && npm run build"

# Setup PM2
ssh $SSH_USER@$SERVER_IP "cd $APP_DIR && pm2 start ecosystem.config.js"

# Configure Nginx (không xóa config cũ)
ssh $SSH_USER@$SERVER_IP "sudo cp $APP_DIR/nginx-configs/tikminer.info /etc/nginx/sites-available/"
ssh $SSH_USER@$SERVER_IP "sudo ln -sf /etc/nginx/sites-available/tikminer.info /etc/nginx/sites-enabled/"
ssh $SSH_USER@$SERVER_IP "sudo nginx -t && sudo systemctl reload nginx"

echo "✅ Deploy completed! App available at: https://$DOMAIN"
```

---

## 🔍 Kiểm tra và Troubleshooting

### 1. Kiểm tra các app đang chạy:
```bash
# Kiểm tra PM2 processes
pm2 list

# Kiểm tra Nginx sites
sudo nginx -T | grep server_name

# Kiểm tra ports đang sử dụng
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
sudo netstat -tlnp | grep :3001
```

### 2. Kiểm tra logs:
```bash
# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PM2 logs
pm2 logs ai-image-backend
```

### 3. Test từng domain:
```bash
# Test printzy.info (app cũ)
curl -I http://printzy.info

# Test tikminer.info (app mới)
curl -I http://tikminer.info

# Test API
curl -I http://api.tikminer.info/health
```

---

## ⚠️ Lưu ý quan trọng

1. **Backup trước khi deploy**: Luôn backup cấu hình hiện tại
2. **Test từng bước**: Deploy từng phần và test
3. **DNS Configuration**: Đảm bảo DNS trỏ đúng
4. **SSL Certificates**: Cài đặt SSL cho domain mới
5. **Resource Management**: Monitor RAM/CPU usage

---

## 🎯 Kết quả mong đợi

Sau khi deploy thành công:
- **printzy.info** → App cũ (không thay đổi)
- **tikminer.info** → AI Image App mới
- **api.tikminer.info** → API của AI Image App
- Cả 2 app chạy song song không conflict

Bạn muốn tôi tạo script deploy cụ thể cho trường hợp này không?
