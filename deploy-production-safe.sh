#!/bin/bash

# 🚀 SAFE PRODUCTION DEPLOYMENT SCRIPT
# This script prevents common deployment mistakes

set -e  # Exit on any error

echo "🚀 Starting SAFE Production Deployment..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Not in project root directory! Please run from /opt/AiImage"
    exit 1
fi

# Navigate to backend directory
cd backend

echo "📁 Working in: $(pwd)"
echo ""

# 1. BACKUP PRODUCTION .env
print_status "Step 1: Backing up production .env file..."
if [ -f ".env" ]; then
    BACKUP_NAME=".env.backup.$(date +%Y%m%d_%H%M%S)"
    cp .env "$BACKUP_NAME"
    print_status "Backed up .env to $BACKUP_NAME"
else
    print_warning "No .env file found! This might be a problem."
fi

# 2. PULL LATEST CODE
print_status "Step 2: Pulling latest code from Git..."
git pull origin main
print_status "Code pulled successfully"

# 3. CHECK PRISMA SCHEMA
print_status "Step 3: Checking Prisma schema configuration..."
if grep -q 'url.*dev.db' prisma/schema.prisma; then
    print_error "CRITICAL ERROR: Prisma schema has hardcoded dev.db path!"
    print_error "This will cause production to use development database!"
    print_error "Please fix prisma/schema.prisma first:"
    print_error "Change: url = \"file:./dev.db\""
    print_error "To:     url = env(\"DATABASE_URL\")"
    exit 1
fi

if grep -q 'env("DATABASE_URL")' prisma/schema.prisma; then
    print_status "Prisma schema correctly uses environment variable"
else
    print_error "Prisma schema doesn't use env(\"DATABASE_URL\")!"
    exit 1
fi

# 4. CHECK PRODUCTION .env
print_status "Step 4: Checking production .env configuration..."
if grep -q "prod.db" .env; then
    print_status "Production .env correctly points to prod.db"
else
    print_warning "Production .env might not point to prod.db"
    print_warning "Current DATABASE_URL:"
    grep DATABASE_URL .env || echo "No DATABASE_URL found!"
fi

# 5. INSTALL DEPENDENCIES
print_status "Step 5: Installing dependencies..."
npm install
print_status "Dependencies installed"

# 6. GENERATE PRISMA CLIENT
print_status "Step 6: Generating Prisma client..."
npx prisma generate
print_status "Prisma client generated"

# 7. PUSH SCHEMA TO PRODUCTION DATABASE
print_status "Step 7: Pushing schema to production database..."
npx prisma db push
print_status "Schema pushed to production database"

# 8. BUILD FOR PRODUCTION
print_status "Step 8: Building for production..."
npm run build
print_status "Production build completed"

# 9. RESTART PM2
print_status "Step 9: Restarting PM2 service..."
pm2 restart ai-image-backend || pm2 start dist/server.js --name ai-image-backend
print_status "PM2 service restarted"

# 10. VERIFY DEPLOYMENT
print_status "Step 10: Verifying deployment..."
echo "Checking PM2 status:"
pm2 status

echo ""
echo "Checking recent logs:"
pm2 logs ai-image-backend --lines 10

echo ""
print_status "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "================================================"
echo "✅ Production .env backed up"
echo "✅ Code pulled from Git"
echo "✅ Prisma schema verified"
echo "✅ Dependencies installed"
echo "✅ Prisma client generated"
echo "✅ Schema pushed to production database"
echo "✅ Production build completed"
echo "✅ PM2 service restarted"
echo ""
echo "🔍 Next steps:"
echo "1. Check PM2 logs: pm2 logs ai-image-backend"
echo "2. Test API: curl http://localhost:3001/api/health"
echo "3. Monitor for any errors"
echo ""
echo "📝 Backup files created:"
ls -la .env.backup.* 2>/dev/null || echo "No backup files found"
