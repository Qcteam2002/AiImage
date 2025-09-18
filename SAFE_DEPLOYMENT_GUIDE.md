# Safe Deployment Guide - Ubuntu Server với App hiện có

## 🚨 **QUAN TRỌNG: Deploy an toàn không ảnh hưởng app hiện có**

### 📋 **Kiểm tra trước khi deploy**

#### 1. **Kiểm tra app hiện có:**
```bash
# Kiểm tra ports đang sử dụng
sudo netstat -tulpn | grep LISTEN

# Kiểm tra services đang chạy
sudo systemctl list-units --type=service --state=running

# Kiểm tra database hiện có
sudo -u postgres psql -l
# hoặc
mysql -u root -p -e "SHOW DATABASES;"
```

#### 2. **Kiểm tra disk space:**
```bash
df -h
# Cần ít nhất 5GB trống cho app mới
```

---

## 🔧 **Cấu hình Ports an toàn**

### **App hiện có vs App mới:**
| Service | App hiện có | App mới | Ghi chú |
|---------|-------------|---------|---------|
| **Frontend** | Port 80/443 | Port 3000 | Nginx proxy |
| **Backend API** | Port 8080 | Port 3001 | Khác port |
| **Database** | Port 5432 | Port 5432 | **CÙNG PORT - CẨN THẬN** |
| **Redis** | Port 6379 | Port 6379 | **CÙNG PORT - CẨN THẬN** |
| **Image Processing** | - | Port 3002 | Port mới |

---

## 🗄️ **Database Strategy - QUAN TRỌNG NHẤT**

### **Option 1: Sử dụng database riêng (KHUYẾN NGHỊ)**
```bash
# Tạo database mới cho app AI Image
sudo -u postgres createdb ai_image_db
sudo -u postgres createuser ai_image_user
sudo -u postgres psql -c "ALTER USER ai_image_user PASSWORD 'ai_image_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ai_image_db TO ai_image_user;"
```

### **Option 2: Sử dụng schema riêng trong cùng database**
```bash
# Nếu phải dùng chung database
sudo -u postgres psql -d existing_db -c "CREATE SCHEMA ai_image;"
sudo -u postgres psql -d existing_db -c "GRANT USAGE ON SCHEMA ai_image TO ai_image_user;"
```

---

## 🐳 **Docker Setup an toàn**

### **1. Tạo network riêng:**
```bash
# Tạo Docker network riêng cho app AI
docker network create ai-image-network
```

### **2. Docker Compose cho app AI:**
```yaml
# docker-compose-ai.yml
version: '3.8'

services:
  # PostgreSQL cho app AI (port khác)
  postgres-ai:
    image: postgres:15
    container_name: postgres-ai
    environment:
      POSTGRES_DB: ai_image_db
      POSTGRES_USER: ai_image_user
      POSTGRES_PASSWORD: ai_image_password
    ports:
      - "5433:5432"  # Port khác với app hiện có
    volumes:
      - postgres_ai_data:/var/lib/postgresql/data
      - ./backend/src/migrations:/docker-entrypoint-initdb.d
    networks:
      - ai-image-network

  # Redis cho app AI (port khác)
  redis-ai:
    image: redis:7-alpine
    container_name: redis-ai
    ports:
      - "6380:6379"  # Port khác với app hiện có
    networks:
      - ai-image-network

networks:
  ai-image-network:
    external: true

volumes:
  postgres_ai_data:
```

---

## ⚙️ **Environment Configuration**

### **1. Backend (.env):**
```bash
# Database - sử dụng port và database riêng
DATABASE_URL=postgresql://ai_image_user:ai_image_password@localhost:5433/ai_image_db

# Redis - sử dụng port riêng
REDIS_URL=redis://localhost:6380

# Ports
PORT=3001
IMAGE_PROCESSING_API_URL=http://localhost:3002

# JWT & Email (giữ nguyên)
JWT_SECRET=your_jwt_secret_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
FRONTEND_URL=http://your-domain.com:3000
```

### **2. Image Processing API (.env):**
```bash
# Port riêng
PORT=3002

# OpenRouter API
OPENROUTER_API_KEY=your_openrouter_key

# Site info
SITE_URL=http://your-domain.com
SITE_NAME=AI Image Processing

# Main API URL
MAIN_API_URL=http://localhost:3001
```

### **3. Frontend (.env):**
```bash
# Backend API URL
VITE_API_URL=http://your-domain.com:3001
VITE_IMAGE_PROCESSING_URL=http://your-domain.com:3002
```

---

## 🚀 **Deployment Steps**

### **Step 1: Chuẩn bị server**
```bash
# Cập nhật system
sudo apt update && sudo apt upgrade -y

# Cài đặt Node.js 18 (nếu chưa có)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cài đặt PM2 (nếu chưa có)
sudo npm install -g pm2

# Cài đặt Docker (nếu chưa có)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### **Step 2: Tạo thư mục app**
```bash
# Tạo thư mục riêng cho app AI
sudo mkdir -p /opt/ai-image-app
sudo chown $USER:$USER /opt/ai-image-app
cd /opt/ai-image-app
```

### **Step 3: Upload code**
```bash
# Upload code từ máy local
scp -r /Users/vophuong/Documents/AIImage/* user@your-server:/opt/ai-image-app/

# Hoặc clone từ Git
git clone https://github.com/your-repo/ai-image-app.git .
```

### **Step 4: Cài đặt dependencies**
```bash
# Backend
cd backend
npm install
npm run build

# Image Processing API
cd ../image-processing-api
npm install
npm run build

# Frontend
cd ../frontend
npm install
npm run build
```

### **Step 5: Setup Database**
```bash
# Khởi động Docker containers
docker-compose -f docker-compose-ai.yml up -d

# Chờ database khởi động
sleep 10

# Chạy migrations
cd backend
npm run migrate
```

### **Step 6: Cấu hình PM2**
```bash
# Tạo PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'ai-image-backend',
      script: './backend/dist/server.js',
      cwd: '/opt/ai-image-app',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      exec_mode: 'fork'
    },
    {
      name: 'ai-image-processing',
      script: './image-processing-api/dist/server.js',
      cwd: '/opt/ai-image-app',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      instances: 1,
      exec_mode: 'fork'
    },
    {
      name: 'ai-image-frontend',
      script: 'serve',
      args: '-s frontend/dist -l 3000',
      cwd: '/opt/ai-image-app',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      exec_mode: 'fork'
    }
  ]
};
EOF

# Cài đặt serve cho frontend
sudo npm install -g serve

# Khởi động apps
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🔒 **Nginx Configuration**

### **1. Tạo config cho app AI:**
```bash
sudo nano /etc/nginx/sites-available/ai-image-app
```

### **2. Nội dung config:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

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
    location /api/images/ {
        proxy_pass http://localhost:3002;
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

### **3. Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/ai-image-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔍 **Monitoring & Logs**

### **1. Kiểm tra status:**
```bash
# PM2 status
pm2 status

# Docker containers
docker ps

# Ports
sudo netstat -tulpn | grep -E ":(3000|3001|3002|5433|6380)"
```

### **2. Logs:**
```bash
# PM2 logs
pm2 logs ai-image-backend
pm2 logs ai-image-processing
pm2 logs ai-image-frontend

# Docker logs
docker logs postgres-ai
docker logs redis-ai
```

---

## 🛡️ **Security & Backup**

### **1. Firewall:**
```bash
# Chỉ mở ports cần thiết
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### **2. Backup database:**
```bash
# Backup script
cat > backup-ai-db.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
docker exec postgres-ai pg_dump -U ai_image_user ai_image_db > /opt/ai-image-app/backups/ai_db_\$DATE.sql
find /opt/ai-image-app/backups -name "*.sql" -mtime +7 -delete
EOF

chmod +x backup-ai-db.sh
mkdir -p /opt/ai-image-app/backups

# Cron job cho backup hàng ngày
echo "0 2 * * * /opt/ai-image-app/backup-ai-db.sh" | sudo crontab -
```

---

## 🚨 **Troubleshooting**

### **1. Port conflicts:**
```bash
# Kiểm tra port đang sử dụng
sudo lsof -i :3001
sudo lsof -i :3002

# Kill process nếu cần
sudo kill -9 <PID>
```

### **2. Database connection issues:**
```bash
# Test database connection
docker exec -it postgres-ai psql -U ai_image_user -d ai_image_db -c "SELECT 1;"
```

### **3. PM2 issues:**
```bash
# Restart apps
pm2 restart all

# Reload ecosystem
pm2 reload ecosystem.config.js
```

---

## ✅ **Checklist trước khi deploy**

- [ ] Kiểm tra ports không conflict
- [ ] Database riêng hoặc schema riêng
- [ ] Docker network riêng
- [ ] Environment variables đúng
- [ ] Nginx config không conflict
- [ ] Firewall settings
- [ ] Backup strategy
- [ ] Monitoring setup

---

## 🎯 **Kết quả mong đợi**

Sau khi deploy thành công:
- **App AI Image**: `http://your-domain.com:3000`
- **Backend API**: `http://your-domain.com:3001`
- **Image Processing**: `http://your-domain.com:3002`
- **Database**: Port 5433 (riêng biệt)
- **Redis**: Port 6380 (riêng biệt)

**App hiện có hoàn toàn không bị ảnh hưởng!** 🎉
