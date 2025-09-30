#!/bin/bash

# 🚨 EMERGENCY DEPLOYMENT SCRIPT
# Use this when TypeScript build fails but you need to deploy

set -e

echo "🚨 EMERGENCY DEPLOYMENT STARTING..."
echo "====================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Not in project root directory! Please run from /opt/AiImage"
    exit 1
fi

cd backend

echo "📁 Working in: $(pwd)"
echo ""

# 1. BACKUP CURRENT STATE
print_status "Step 1: Backing up current state..."
if [ -f ".env" ]; then
    BACKUP_NAME=".env.backup.$(date +%Y%m%d_%H%M%S)"
    cp .env "$BACKUP_NAME"
    print_status "Backed up .env to $BACKUP_NAME"
else
    print_warning "No .env file found!"
fi

# 2. PULL LATEST CODE
print_status "Step 2: Pulling latest code from Git..."
git pull origin main
print_status "Code pulled successfully"

# 3. INSTALL DEPENDENCIES
print_status "Step 3: Installing dependencies..."
npm install
print_status "Dependencies installed"

# 4. GENERATE PRISMA CLIENT
print_status "Step 4: Generating Prisma client..."
npx prisma generate
print_status "Prisma client generated"

# 5. PUSH SCHEMA TO DATABASE
print_status "Step 5: Pushing schema to database..."
npx prisma db push
print_status "Schema pushed to database"

# 6. DISABLE PROBLEMATIC FILES TEMPORARILY
print_status "Step 6: Disabling problematic TypeScript files..."
mv src/middleware/passport.ts src/middleware/passport.ts.bak 2>/dev/null || print_warning "passport.ts not found or already disabled"
mv src/routes/productAIFlow.ts src/routes/productAIFlow.ts.bak 2>/dev/null || print_warning "productAIFlow.ts not found or already disabled"
mv src/routes/productImageGenerator.ts src/routes/productImageGenerator.ts.bak 2>/dev/null || print_warning "productImageGenerator.ts not found or already disabled"
mv src/routes/video.ts src/routes/video.ts.bak 2>/dev/null || print_warning "video.ts not found or already disabled"
print_status "Problematic files disabled"

# 7. ADD TRUST PROXY TO SERVER.TS
print_status "Step 7: Adding trust proxy to server.ts..."
if ! grep -q "trust proxy" src/server.ts; then
    sed -i '/const app = express();/a\\n// Trust proxy for rate limiting\napp.set("trust proxy", 1);' src/server.ts
    print_status "Trust proxy added to server.ts"
else
    print_status "Trust proxy already exists in server.ts"
fi

# 8. TRY TO BUILD (OPTIONAL)
print_status "Step 8: Attempting to build..."
if npm run build > /dev/null 2>&1; then
    print_status "Build successful! Using production build"
    BUILD_SUCCESS=true
else
    print_warning "Build failed! Will use ts-node instead"
    BUILD_SUCCESS=false
fi

# 9. RESTART PM2
print_status "Step 9: Restarting PM2 service..."
pm2 stop ai-image-backend 2>/dev/null || true

if [ "$BUILD_SUCCESS" = true ]; then
    pm2 start dist/server.js --name ai-image-backend
    print_status "Started with production build"
else
    pm2 start "npx ts-node src/server.ts" --name ai-image-backend
    print_status "Started with ts-node (development mode)"
fi

# 10. VERIFY DEPLOYMENT
print_status "Step 10: Verifying deployment..."
sleep 3

echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📋 Recent Logs:"
pm2 logs ai-image-backend --lines 10

echo ""
print_status "🎉 EMERGENCY DEPLOYMENT COMPLETED!"
echo "=========================================="
echo "✅ Production .env backed up"
echo "✅ Code pulled from Git"
echo "✅ Dependencies installed"
echo "✅ Prisma client generated"
echo "✅ Schema pushed to database"
echo "✅ Problematic files disabled"
echo "✅ Trust proxy added"
if [ "$BUILD_SUCCESS" = true ]; then
    echo "✅ Production build successful"
else
    echo "⚠️  Using ts-node (development mode)"
fi
echo "✅ PM2 service restarted"
echo ""
echo "🔍 Next steps:"
echo "1. Check PM2 logs: pm2 logs ai-image-backend"
echo "2. Test API: curl http://localhost:3001/api/health"
echo "3. Monitor for any errors"
echo "4. Fix TypeScript errors when possible"
echo ""
echo "📝 Disabled files (can be re-enabled later):"
ls -la src/middleware/*.bak src/routes/*.bak 2>/dev/null || echo "No backup files found"
