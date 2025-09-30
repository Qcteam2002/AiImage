#!/bin/bash

# 🔍 PRE-DEPLOYMENT CHECK SCRIPT
# Run this before deploying to catch issues early

set -e

echo "🔍 PRE-DEPLOYMENT CHECK"
echo "======================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_ok() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in project root
if [ ! -f "package.json" ]; then
    print_error "Not in project root! Please run from project root directory"
    exit 1
fi

cd backend

echo "📁 Checking backend directory: $(pwd)"
echo ""

# 1. Check Prisma schema
echo "1️⃣ Checking Prisma schema..."
if [ ! -f "prisma/schema.prisma" ]; then
    print_error "prisma/schema.prisma not found!"
    exit 1
fi

if grep -q 'url.*dev.db' prisma/schema.prisma; then
    print_error "CRITICAL: Prisma schema has hardcoded dev.db path!"
    print_error "This will cause production to use development database!"
    print_error "Fix: Change 'url = \"file:./dev.db\"' to 'url = env(\"DATABASE_URL\")'"
    exit 1
fi

if grep -q 'env("DATABASE_URL")' prisma/schema.prisma; then
    print_ok "Prisma schema correctly uses environment variable"
else
    print_error "Prisma schema doesn't use env(\"DATABASE_URL\")!"
    exit 1
fi

# 2. Check .env file
echo ""
echo "2️⃣ Checking .env file..."
if [ ! -f ".env" ]; then
    print_warn "No .env file found! This might be intentional for production"
else
    if grep -q "prod.db" .env; then
        print_ok "Production .env points to prod.db"
    elif grep -q "dev.db" .env; then
        print_warn "WARNING: .env points to dev.db - this might be wrong for production!"
    else
        print_warn "Could not determine database path in .env"
    fi
fi

# 3. Check for TypeScript errors
echo ""
echo "3️⃣ Checking TypeScript compilation..."
if npm run build > /dev/null 2>&1; then
    print_ok "TypeScript compilation successful"
else
    print_error "TypeScript compilation failed!"
    echo "Run 'npm run build' to see errors"
    exit 1
fi

# 4. Check Prisma client generation
echo ""
echo "4️⃣ Checking Prisma client generation..."
if npx prisma generate > /dev/null 2>&1; then
    print_ok "Prisma client generation successful"
else
    print_error "Prisma client generation failed!"
    echo "Run 'npx prisma generate' to see errors"
    exit 1
fi

# 5. Check database connection
echo ""
echo "5️⃣ Checking database connection..."
if npx prisma db push --accept-data-loss > /dev/null 2>&1; then
    print_ok "Database connection successful"
else
    print_warn "Database connection failed - this might be expected if database doesn't exist yet"
fi

# 6. Check for common issues
echo ""
echo "6️⃣ Checking for common issues..."

# Check for hardcoded localhost URLs
if grep -r "localhost" src/ > /dev/null 2>&1; then
    print_warn "Found 'localhost' references in source code - check if these should be environment variables"
fi

# Check for hardcoded development paths
if grep -r "/Users/" src/ > /dev/null 2>&1; then
    print_warn "Found hardcoded local paths in source code - these won't work on production"
fi

# Check for console.log statements
CONSOLE_COUNT=$(grep -r "console.log" src/ | wc -l)
if [ "$CONSOLE_COUNT" -gt 0 ]; then
    print_warn "Found $CONSOLE_COUNT console.log statements - consider removing for production"
fi

# 7. Check PM2 status (if on production server)
echo ""
echo "7️⃣ Checking PM2 status..."
if command -v pm2 > /dev/null 2>&1; then
    if pm2 status > /dev/null 2>&1; then
        print_ok "PM2 is available"
        echo "Current PM2 processes:"
        pm2 status
    else
        print_warn "PM2 is installed but no processes running"
    fi
else
    print_warn "PM2 not found - this might not be a production server"
fi

echo ""
echo "🎯 PRE-DEPLOYMENT CHECK COMPLETE"
echo "================================"

if [ $? -eq 0 ]; then
    print_ok "All checks passed! Safe to deploy."
    echo ""
    echo "Next steps:"
    echo "1. Run: ./deploy-production-safe.sh"
    echo "2. Monitor: pm2 logs ai-image-backend"
    echo "3. Test: curl http://localhost:3001/api/health"
else
    print_error "Some checks failed! Fix issues before deploying."
    exit 1
fi
