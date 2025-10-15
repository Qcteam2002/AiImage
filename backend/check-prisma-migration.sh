#!/bin/bash

# 🔍 PRISMA MIGRATION CHECKER
# Kiểm tra xem database có cần migrate hay không

set -e

echo "🔍 Checking Prisma Migration Status..."
echo "========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Kiểm tra xem có trong thư mục backend không
if [ ! -f "prisma/schema.prisma" ]; then
    print_error "Không tìm thấy prisma/schema.prisma. Đảm bảo bạn đang ở thư mục backend!"
    exit 1
fi

echo ""
print_info "Current Prisma Schema Configuration:"
echo "-------------------------------------------"
grep "datasource db" -A 3 prisma/schema.prisma
echo ""

# Kiểm tra DATABASE_URL
if [ -f ".env" ]; then
    print_info "Current DATABASE_URL:"
    grep DATABASE_URL .env || print_warning "Không tìm thấy DATABASE_URL trong .env"
else
    print_warning "Không tìm thấy file .env"
fi

echo ""
echo "========================================="
echo "🔍 Checking Migration Status..."
echo "========================================="

# Kiểm tra xem có migrations folder không
if [ ! -d "prisma/migrations" ]; then
    print_warning "Không tìm thấy thư mục prisma/migrations"
    print_info "Bạn đang dùng 'prisma db push' thay vì 'prisma migrate'"
    print_info "Với SQLite và db push, không có migration history."
    echo ""
    print_info "Để kiểm tra xem schema có khác DB hiện tại:"
    echo "  Chạy: npx prisma db push --preview-feature"
    echo ""
    
    # Kiểm tra schema có khớp với DB không
    print_info "Checking if schema matches database..."
    if npx prisma db push --accept-data-loss --skip-generate 2>&1 | grep -q "already in sync"; then
        print_status "✨ Database đã sync với schema. Không cần thay đổi!"
    else
        print_warning "🔄 Database cần được sync với schema!"
        print_info "Changes detected. Run: npx prisma db push"
    fi
else
    print_info "Tìm thấy migrations folder. Checking status..."
    
    # Check migration status
    MIGRATION_STATUS=$(npx prisma migrate status 2>&1 || true)
    
    if echo "$MIGRATION_STATUS" | grep -q "Database schema is up to date"; then
        print_status "✨ Database đã được migrate đầy đủ!"
    elif echo "$MIGRATION_STATUS" | grep -q "following migration.*not yet been applied"; then
        print_warning "🔄 Có migrations chưa được apply!"
        echo ""
        echo "$MIGRATION_STATUS"
        echo ""
        print_info "Để apply migrations, chạy:"
        echo "  Trên development: npx prisma migrate dev"
        echo "  Trên production: npx prisma migrate deploy"
    else
        print_info "Migration status:"
        echo "$MIGRATION_STATUS"
    fi
fi

echo ""
echo "========================================="
print_info "📊 Database Information:"
echo "========================================="

# Kiểm tra database file có tồn tại không
if grep -q "file:./dev.db" prisma/schema.prisma; then
    DB_FILE="prisma/dev.db"
elif [ -f ".env" ]; then
    DB_PATH=$(grep DATABASE_URL .env | cut -d'=' -f2 | sed 's/file://' | tr -d '"' | tr -d "'")
    if [ -n "$DB_PATH" ]; then
        DB_FILE="$DB_PATH"
    fi
fi

if [ -n "$DB_FILE" ] && [ -f "$DB_FILE" ]; then
    print_status "Database file exists: $DB_FILE"
    ls -lh "$DB_FILE"
    echo ""
    
    # Hiển thị các tables hiện có
    print_info "Existing tables in database:"
    echo "-------------------------------------------"
    sqlite3 "$DB_FILE" ".tables" 2>/dev/null || print_warning "Không thể đọc database file"
else
    print_warning "Database file không tồn tại: $DB_FILE"
    print_info "Database sẽ được tạo khi chạy: npx prisma db push"
fi

echo ""
echo "========================================="
print_info "🚀 Recommended Actions:"
echo "========================================="

echo ""
echo "1️⃣  Nếu bạn vừa pull code mới:"
echo "   npx prisma generate        # Generate Prisma Client"
echo "   npx prisma db push         # Sync schema với database"
echo ""
echo "2️⃣  Nếu bạn thay đổi schema.prisma:"
echo "   npx prisma generate        # Generate Prisma Client"
echo "   npx prisma db push         # Apply changes to database"
echo ""
echo "3️⃣  Trên production server:"
echo "   npx prisma generate        # Generate Prisma Client"
echo "   npx prisma migrate deploy  # Apply migrations (nếu dùng migrate)"
echo "   npx prisma db push         # Hoặc sync schema (nếu dùng db push)"
echo ""
echo "4️⃣  Để xem database GUI:"
echo "   npx prisma studio          # Open Prisma Studio"
echo ""

print_status "✅ Migration check completed!"

