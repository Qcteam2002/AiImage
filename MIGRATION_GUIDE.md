# 📘 Hướng Dẫn Kiểm Tra & Deploy với Database Migration

## 🚨 Vấn Đề Gặp Phải

### Lỗi Express Rate Limit
```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false
```

**Nguyên nhân:** Ứng dụng chạy sau Nginx proxy nhưng chưa enable `trust proxy` trong Express.

**Đã fix:** Thêm `app.set('trust proxy', true)` vào `backend/src/server.ts`

---

## 🔍 Làm Sao Biết Database Cần Migrate?

### Cách 1: Script Tự Động Kiểm Tra (KHUYẾN NGHỊ)

```bash
cd /opt/AiImage/backend
./check-prisma-migration.sh
```

Script này sẽ:
- ✅ Kiểm tra Prisma schema configuration
- ✅ So sánh schema với database hiện tại
- ✅ Hiển thị các thay đổi cần thiết
- ✅ Đưa ra hướng dẫn cụ thể

### Cách 2: Kiểm Tra Thủ Công

```bash
cd /opt/AiImage/backend

# Xem schema hiện tại
cat prisma/schema.prisma

# Kiểm tra database có sync không (dry-run)
npx prisma db push --skip-generate --dry-run

# Nếu có thay đổi, sẽ hiện:
# "Database schema is not in sync with Prisma schema"
```

### Cách 3: Kiểm Tra Migration History

```bash
# Nếu dùng migrations (thay vì db push)
npx prisma migrate status

# Output sẽ cho biết:
# - Migrations nào đã apply
# - Migrations nào chưa apply
```

---

## 🚀 Cách Deploy Khi Có Database Changes

### Option 1: Smart Deploy Script (KHUYẾN NGHỊ)

```bash
cd /opt/AiImage/backend
./deploy-with-check.sh
```

Script này sẽ TỰ ĐỘNG:
1. ✅ Backup .env và database
2. ✅ Pull code mới
3. ✅ Kiểm tra Prisma configuration
4. ✅ **KIỂM TRA & HIỂN THỊ database changes**
5. ✅ Hỏi xác nhận trước khi apply
6. ✅ Install dependencies
7. ✅ Generate Prisma client
8. ✅ Apply database changes (nếu cần)
9. ✅ Build code
10. ✅ Restart PM2
11. ✅ Verify deployment

### Option 2: Deploy Thủ Công

```bash
cd /opt/AiImage/backend

# 1. Backup
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
cp prisma/prod.db prisma/prod.db.backup.$(date +%Y%m%d_%H%M%S)

# 2. Pull code
git pull origin main

# 3. Kiểm tra schema changes
./check-prisma-migration.sh

# 4. Install dependencies
npm install

# 5. Generate Prisma client
npx prisma generate

# 6. Apply database changes (nếu cần)
npx prisma db push

# 7. Build
npm run build

# 8. Restart
pm2 restart ai-image-backend

# 9. Verify
pm2 logs ai-image-backend --lines 20
curl http://localhost:3001/health
```

---

## 📊 Các Tình Huống Thường Gặp

### Tình huống 1: Code mới KHÔNG thay đổi Schema

```bash
$ ./check-prisma-migration.sh
✅ Database đã sync với schema. Không cần thay đổi!
```

**Action:** Deploy bình thường, không cần lo database.

```bash
cd /opt/AiImage/backend
git pull origin main
npm install
npx prisma generate
npm run build
pm2 restart ai-image-backend
```

### Tình huống 2: Thêm Field Mới (Không Breaking)

```bash
$ ./check-prisma-migration.sh
⚠️  Database cần được sync với schema!
Changes detected: Added field "newField" to model "User"
```

**Action:** An toàn, có thể deploy ngay.

```bash
npx prisma db push  # Apply changes
npm run build
pm2 restart ai-image-backend
```

### Tình huống 3: Xóa/Đổi Field (Breaking Change)

```bash
$ ./check-prisma-migration.sh
⚠️  Database cần được sync với schema!
⚠️  WARNING: Data loss may occur!
Changes: Removed field "oldField" from model "User"
```

**Action:** THẬN TRỌNG! Có thể mất data.

```bash
# 1. Backup database trước
cp prisma/prod.db prisma/prod.db.backup.important

# 2. Đọc kỹ changes
npx prisma db push --preview-feature

# 3. Nếu chắc chắn, apply
npx prisma db push --accept-data-loss
```

### Tình huống 4: Database File Không Tồn Tại

```bash
$ ./check-prisma-migration.sh
⚠️  Database file không tồn tại: prisma/prod.db
```

**Action:** Tạo database mới (chỉ trên setup lần đầu).

```bash
npx prisma db push  # Sẽ tạo database mới
npm run db:seed     # Seed initial data (nếu cần)
```

---

## 🛠️ Prisma Commands Cheat Sheet

### Kiểm Tra & Thông Tin

```bash
# Kiểm tra migration status
npx prisma migrate status

# Xem database schema hiện tại
npx prisma db pull

# Mở Prisma Studio (GUI)
npx prisma studio
```

### Thay Đổi Database

```bash
# Sync schema với database (development)
npx prisma db push

# Tạo migration mới (nếu dùng migrations)
npx prisma migrate dev --name add_new_field

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (⚠️ XÓA TẤT CẢ DATA)
npx prisma migrate reset
```

### Generate Client

```bash
# Generate Prisma client
npx prisma generate

# Validate schema
npx prisma validate

# Format schema file
npx prisma format
```

---

## 🔧 Troubleshooting

### Lỗi: "Environment variable not found: DATABASE_URL"

**Giải pháp:**
```bash
# Kiểm tra .env file
cat .env | grep DATABASE_URL

# Nếu không có, thêm vào:
echo 'DATABASE_URL="file:./prisma/prod.db"' >> .env
```

### Lỗi: "Migration failed" hoặc "Database locked"

**Giải pháp:**
```bash
# Stop PM2 service trước
pm2 stop ai-image-backend

# Sau đó chạy migration
npx prisma db push

# Start lại service
pm2 start ai-image-backend
```

### Lỗi: Trust Proxy Error (đã fix)

```
ValidationError: The 'X-Forwarded-For' header is set but Express 'trust proxy' setting is false
```

**Đã fix trong code:** `app.set('trust proxy', true)` đã được thêm vào `server.ts`

**Verify fix:**
```bash
# Rebuild và restart
npm run build
pm2 restart ai-image-backend

# Check logs - lỗi này không còn xuất hiện
pm2 logs ai-image-backend
```

---

## 📋 Checklist Deploy An Toàn

```
□ Backup .env file
□ Backup database (prod.db)
□ Check Prisma schema configuration
□ Check database migration status
□ Pull latest code
□ Install dependencies
□ Generate Prisma client
□ Apply database changes (nếu cần)
□ Build application
□ Stop PM2 service
□ Start PM2 service
□ Verify health endpoint
□ Check PM2 logs
□ Monitor for errors
```

---

## 🆘 Emergency Rollback

Nếu deploy bị lỗi, rollback nhanh:

```bash
cd /opt/AiImage/backend

# 1. Stop service
pm2 stop ai-image-backend

# 2. Restore .env
cp .env.backup.YYYYMMDD_HHMMSS .env

# 3. Restore database
cp prisma/prod.db.backup.YYYYMMDD_HHMMSS prisma/prod.db

# 4. Rollback code
git reset --hard HEAD~1  # hoặc git checkout <commit-hash>

# 5. Rebuild
npm install
npx prisma generate
npm run build

# 6. Start service
pm2 start ai-image-backend

# 7. Verify
pm2 logs ai-image-backend
curl http://localhost:3001/health
```

---

## 📞 Liên Hệ

Nếu gặp vấn đề:
1. Kiểm tra logs: `pm2 logs ai-image-backend`
2. Kiểm tra database: `./check-prisma-migration.sh`
3. Review documentation này
4. Check backup files: `ls -la *.backup.*`

---

**Created:** 2025-10-15  
**Last Updated:** 2025-10-15  
**Status:** ✅ Active & Tested

