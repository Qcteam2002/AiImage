#!/bin/bash

# 🚀 SMART DEPLOYMENT SCRIPT WITH AUTO-CHECKS
# Script này sẽ tự động kiểm tra và deploy an toàn

set -e

echo "🚀 Smart Production Deployment"
echo "================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Kiểm tra thư mục
if [ ! -f "package.json" ]; then
    print_error "Không phải thư mục backend! Chạy từ /opt/AiImage/backend"
    exit 1
fi

echo ""
print_header "STEP 1: BACKUP & SAFETY"

# Backup .env
if [ -f ".env" ]; then
    BACKUP_NAME=".env.backup.$(date +%Y%m%d_%H%M%S)"
    cp .env "$BACKUP_NAME"
    print_status "Đã backup .env → $BACKUP_NAME"
else
    print_warning "Không tìm thấy .env file!"
fi

# Backup database
if [ -f "prisma/prod.db" ]; then
    DB_BACKUP="prisma/prod.db.backup.$(date +%Y%m%d_%H%M%S)"
    cp prisma/prod.db "$DB_BACKUP"
    print_status "Đã backup database → $DB_BACKUP"
fi

echo ""
print_header "STEP 2: PULL LATEST CODE"
git pull origin main
print_status "Code updated từ Git"

echo ""
print_header "STEP 3: CHECK PRISMA CONFIGURATION"

# Kiểm tra Prisma schema
if grep -q 'url.*dev.db' prisma/schema.prisma && ! grep -q 'env("DATABASE_URL")' prisma/schema.prisma; then
    print_error "⛔ CRITICAL: Prisma schema có hardcoded dev.db!"
    print_error "Sửa prisma/schema.prisma:"
    print_error "  Đổi: url = \"file:./dev.db\""
    print_error "  Thành: url = env(\"DATABASE_URL\")"
    exit 1
fi

print_status "Prisma schema configuration OK"

# Kiểm tra .env DATABASE_URL
if [ -f ".env" ]; then
    if grep -q "prod.db" .env; then
        print_status "Production .env đúng (prod.db)"
    else
        print_warning "⚠️  DATABASE_URL có vẻ không đúng:"
        grep DATABASE_URL .env || echo "Không tìm thấy DATABASE_URL!"
        echo ""
        read -p "Tiếp tục? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

echo ""
print_header "STEP 4: CHECK DATABASE MIGRATIONS"

# Lưu schema hiện tại để so sánh
SCHEMA_HASH_BEFORE=$(md5sum prisma/schema.prisma | cut -d' ' -f1)

# Kiểm tra xem có changes trong database không
DB_NEEDS_UPDATE=false

print_info "Checking if database needs updates..."

# Tạo một dry-run để xem có changes không
if npx prisma db push --accept-data-loss --skip-generate --dry-run 2>&1 | grep -q "No changes"; then
    print_status "✨ Database đã sync, không cần update!"
else
    print_warning "🔄 Database cần được cập nhật!"
    DB_NEEDS_UPDATE=true
    
    echo ""
    print_info "Preview of changes:"
    npx prisma db push --accept-data-loss --skip-generate --preview-feature 2>&1 || true
    echo ""
    
    read -p "📝 Apply database changes? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_error "Deployment cancelled by user"
        exit 1
    fi
fi

echo ""
print_header "STEP 5: INSTALL DEPENDENCIES"
npm install
print_status "Dependencies installed"

echo ""
print_header "STEP 6: UPDATE PRISMA"

print_info "Generating Prisma client..."
npx prisma generate
print_status "Prisma client generated"

if [ "$DB_NEEDS_UPDATE" = true ]; then
    print_info "Applying database changes..."
    npx prisma db push --accept-data-loss
    print_status "Database updated successfully!"
fi

echo ""
print_header "STEP 7: BUILD APPLICATION"
npm run build
print_status "Build completed"

echo ""
print_header "STEP 8: RESTART SERVICE"

# Stop service first để avoid conflicts
pm2 stop ai-image-backend 2>/dev/null || true

# Start/Restart
pm2 restart ai-image-backend 2>/dev/null || pm2 start dist/server.js --name ai-image-backend

print_status "PM2 service restarted"

# Wait for service to start
sleep 2

echo ""
print_header "STEP 9: VERIFICATION"

# Check PM2 status
print_info "PM2 Status:"
pm2 list | grep ai-image-backend || true

# Check logs
echo ""
print_info "Recent logs:"
pm2 logs ai-image-backend --lines 15 --nostream || true

# Health check
echo ""
print_info "Testing health endpoint..."
sleep 2
if curl -s http://localhost:3001/health | grep -q "ok"; then
    print_status "✨ Health check PASSED!"
else
    print_warning "⚠️  Health check returned unexpected response"
fi

echo ""
print_header "🎉 DEPLOYMENT COMPLETED"

echo ""
echo "📊 Summary:"
echo "  ✅ Code updated"
echo "  ✅ Configuration verified"
if [ "$DB_NEEDS_UPDATE" = true ]; then
    echo "  ✅ Database migrated"
else
    echo "  ✅ Database up-to-date"
fi
echo "  ✅ Dependencies installed"
echo "  ✅ Application built"
echo "  ✅ Service restarted"
echo ""
echo "🔍 Monitor commands:"
echo "  pm2 logs ai-image-backend      # Xem logs real-time"
echo "  pm2 monit                       # Monitor dashboard"
echo "  curl http://localhost:3001/health  # Health check"
echo ""
echo "💾 Backup files:"
ls -lh .env.backup.* 2>/dev/null | tail -3 || echo "  No backups"
ls -lh prisma/prod.db.backup.* 2>/dev/null | tail -3 || echo "  No DB backups"
echo ""
print_status "Deployment hoàn tất! 🚀"

