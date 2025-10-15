# 🚀 Các Bước Deploy Sau Khi Pull Code Mới

## ✅ Checklist Nhanh

Bạn vừa pull code mới trên server và cần cập nhật để chạy:

```bash
cd /opt/AiImage/backend

# 1. Install dependencies mới (nếu có)
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Sync database schema (apply changes nếu có)
npx prisma db push

# 4. Build code TypeScript
npm run build

# 5. Restart PM2 service
pm2 restart ai-image-backend

# 6. Verify deployment
pm2 logs ai-image-backend --lines 20
curl http://localhost:3001/health
```

---

## 📋 Giải Thích Chi Tiết

### Bước 1: Install Dependencies
```bash
npm install
```
- Cài đặt các packages mới/updated từ `package.json`
- Cần thiết nếu có thêm dependencies mới

### Bước 2: Generate Prisma Client
```bash
npx prisma generate
```
- Tạo TypeScript types từ schema
- Cập nhật Prisma Client code
- **BẮT BUỘC** sau mỗi lần thay đổi schema

### Bước 3: Sync Database
```bash
npx prisma db push
```
- So sánh schema với database hiện tại
- Apply changes nếu có (thêm/sửa tables, fields)
- Không tạo migration files
- An toàn cho SQLite development

**Kiểm tra trước khi apply:**
```bash
npx prisma db push --skip-generate --dry-run
```

### Bước 4: Build TypeScript
```bash
npm run build
```
- Compile TypeScript → JavaScript
- Output vào folder `dist/`
- PM2 chạy từ `dist/server.js`

### Bước 5: Restart Service
```bash
pm2 restart ai-image-backend
```
- Stop service cũ
- Start service mới với code updated
- Maintain uptime (minimal downtime)

### Bước 6: Verify
```bash
# Check logs
pm2 logs ai-image-backend --lines 20

# Health check
curl http://localhost:3001/health
```
- Kiểm tra có errors không
- Verify service running OK

---

## 🔧 Troubleshooting

### Lỗi: "Environment variable not found: DATABASE_URL"

**Giải pháp:** Kiểm tra file `.env`
```bash
cd /opt/AiImage/backend
cat .env | grep DATABASE_URL

# Nếu không có, thêm vào:
echo 'DATABASE_URL="file:./prisma/prod.db"' >> .env
```

### Lỗi: "Database locked"

**Giải pháp:** Stop PM2 trước khi migrate
```bash
pm2 stop ai-image-backend
npx prisma db push
pm2 start ai-image-backend
```

### Lỗi: Build failed

**Giải pháp:** Kiểm tra TypeScript errors
```bash
npm run build 2>&1 | tee build.log
# Xem errors trong build.log
```

### Lỗi: PM2 service không start

**Giải pháp:**
```bash
# Xem logs chi tiết
pm2 logs ai-image-backend --err

# Hoặc delete và start lại
pm2 delete ai-image-backend
pm2 start dist/server.js --name ai-image-backend
```

---

## ⚡ One-Liner Deploy (Sau khi Pull)

```bash
cd /opt/AiImage/backend && npm install && npx prisma generate && npx prisma db push && npm run build && pm2 restart ai-image-backend && pm2 logs ai-image-backend --lines 20
```

---

## 🎯 Script Tự Động (Khuyến Nghị)

Sử dụng script đã tạo sẵn:
```bash
cd /opt/AiImage/backend
./deploy-with-check.sh
```

Script này sẽ tự động:
- ✅ Backup .env và database
- ✅ Check Prisma configuration  
- ✅ Kiểm tra database changes
- ✅ Install dependencies
- ✅ Generate Prisma client
- ✅ Apply database updates
- ✅ Build code
- ✅ Restart PM2
- ✅ Verify deployment

---

## 📊 Workflow Chuẩn

### Trên Development (Local Mac)
```bash
# 1. Sửa code
# 2. Test local
npm run dev

# 3. Commit và push
git add .
git commit -m "Feature: Add new feature"
git push origin main
```

### Trên Production (Server)
```bash
# 1. Pull code mới
cd /opt/AiImage
git pull origin main

# 2. Deploy
cd backend
./deploy-with-check.sh

# 3. Monitor
pm2 monit
```

---

## 🔍 Kiểm Tra Trước Khi Deploy

```bash
# Check git status
git status

# Check xem có schema changes không
git diff HEAD backend/prisma/schema.prisma

# Check dependencies changes
git diff HEAD backend/package.json

# Preview database changes
cd backend
npx prisma db push --skip-generate --dry-run
```

---

**Cập nhật:** 2025-10-15  
**Status:** ✅ Ready to use

