# 🚨 DEPLOYMENT WARNING & CHECKLIST

## ⚠️ **CRITICAL RULES BEFORE DEPLOYING TO PRODUCTION**

### 1. **DATABASE CONFIGURATION CHECK**
```bash
# ✅ ALWAYS CHECK BEFORE DEPLOY:
cat prisma/schema.prisma | grep -A 3 datasource

# Must be:
# datasource db {
#   provider = "sqlite"
#   url      = env("DATABASE_URL")
# }

# ❌ NEVER have hardcoded database path:
# url      = "file:./dev.db"  # WRONG!
```

### 2. **ENVIRONMENT FILE BACKUP**
```bash
# ✅ ALWAYS BACKUP PRODUCTION .env BEFORE PULL:
cd /opt/AiImage/backend
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# ✅ VERIFY PRODUCTION .env HAS CORRECT DATABASE:
cat .env | grep DATABASE_URL
# Should be: DATABASE_URL=file:/opt/AiImage/backend/prisma/prod.db
```

### 3. **DEPLOYMENT CHECKLIST**
```bash
# ✅ STEP-BY-STEP DEPLOYMENT:

# 1. Backup production environment
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# 2. Pull latest code
git pull origin main

# 3. Check Prisma schema
cat prisma/schema.prisma | grep -A 3 datasource

# 4. Install dependencies
npm install

# 5. Generate Prisma client
npx prisma generate

# 6. Push schema to PRODUCTION database
npx prisma db push

# 7. Build for production
npm run build

# 8. Restart PM2
pm2 restart ai-image-backend
pm2 logs ai-image-backend --lines 20
```

### 4. **COMMON MISTAKES TO AVOID**

#### ❌ **MISTAKE 1: Hardcoded Database Path**
```prisma
// WRONG - Never do this:
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"  // ❌ HARDCODED!
}

// CORRECT - Always use environment variable:
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")  // ✅ ENV VARIABLE
}
```

#### ❌ **MISTAKE 2: Not Backing Up Production .env**
```bash
# ❌ WRONG - Pulling without backup:
git pull origin main  # This might overwrite production .env!

# ✅ CORRECT - Always backup first:
cp .env .env.backup
git pull origin main
```

#### ❌ **MISTAKE 3: Using Development Database on Production**
```bash
# ❌ WRONG - This will use dev.db:
DATABASE_URL=file:./dev.db

# ✅ CORRECT - Use production database:
DATABASE_URL=file:/opt/AiImage/backend/prisma/prod.db
```

### 5. **VERIFICATION COMMANDS**

#### Check Database Connection:
```bash
# Verify Prisma is using correct database:
npx prisma db push
# Should show: "SQLite database "prod.db" at "file:/opt/AiImage/backend/prisma/prod.db""
```

#### Check PM2 Status:
```bash
pm2 status
pm2 logs ai-image-backend --lines 20
```

#### Test API Endpoints:
```bash
curl http://localhost:3001/api/health
curl https://api.tikminer.info/api/health
```

### 6. **EMERGENCY ROLLBACK**

If deployment fails:
```bash
# 1. Stop current app
pm2 stop ai-image-backend

# 2. Restore backup .env
cp .env.backup.$(date +%Y%m%d_%H%M%S) .env

# 3. Rollback to previous commit
git reset --hard HEAD~1

# 4. Restart app
pm2 start ai-image-backend
```

### 7. **PRODUCTION ENVIRONMENT SETUP**

#### Required .env Variables for Production:
```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
DATABASE_URL=file:/opt/AiImage/backend/prisma/prod.db
JWT_SECRET=your-production-jwt-secret
# ... other production variables
```

#### Required PM2 Configuration:
```bash
# Start with production build:
pm2 start dist/server.js --name ai-image-backend

# Or with ts-node for development:
pm2 start "npx ts-node src/server.ts" --name ai-image-backend
```

## 🎯 **QUICK DEPLOYMENT SCRIPT**

Create `deploy-production.sh`:
```bash
#!/bin/bash
set -e

echo "🚀 Starting Production Deployment..."

# Backup .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backed up .env file"

# Pull latest code
git pull origin main
echo "✅ Pulled latest code"

# Check Prisma schema
if grep -q 'url.*dev.db' prisma/schema.prisma; then
    echo "❌ ERROR: Prisma schema has hardcoded dev.db path!"
    echo "Please fix prisma/schema.prisma first"
    exit 1
fi

# Install and build
npm install
npx prisma generate
npx prisma db push
npm run build

# Restart PM2
pm2 restart ai-image-backend
pm2 logs ai-image-backend --lines 10

echo "✅ Deployment complete!"
```

### 8. **TYPESCRIPT COMPILATION ERRORS**

#### Common TypeScript Errors and Fixes:

##### ❌ **Error: Missing Dependencies**
```bash
# If you see: Cannot find module 'passport' or its corresponding type declarations
npm install passport @types/passport passport-google-oauth20 @types/passport-google-oauth20
```

##### ❌ **Error: Missing Prisma Fields**
```bash
# If you see: Property 'googleId' does not exist in type 'UserWhereUniqueInput'
# Add missing fields to prisma/schema.prisma:
# model User {
#   id        String   @id @default(uuid())
#   email     String   @unique
#   password  String
#   name      String?
#   googleId  String?  @unique  # Add this
#   avatar    String?           # Add this
#   credits   Int      @default(10)
#   isActive  Boolean  @default(true)
#   isVerified Boolean @default(false)
#   createdAt DateTime @default(now())
#   updatedAt DateTime @updatedAt
# }
```

##### ❌ **Error: Missing Required Fields in Prisma Models**
```bash
# If you see: missing properties from type 'ProductAIFlowUncheckedCreateInput'
# Check prisma/schema.prisma and ensure all required fields are provided:
# model ProductAIFlow {
#   id           String   @id @default(uuid())
#   user_id      String
#   title        String
#   image_url    String?
#   target_market String?  # Add this if missing
#   image1       String?   # Add this if missing
#   status       String
#   created_at   DateTime @default(now())
#   updated_at   DateTime @updatedAt
#   user         User     @relation(fields: [user_id], references: [id])
# }
```

#### Quick Fix for TypeScript Errors:

##### 🔧 **Temporary Disable Problematic Files**
```bash
# If build fails, temporarily disable problematic files:
mv src/middleware/passport.ts src/middleware/passport.ts.bak
mv src/routes/productAIFlow.ts src/routes/productAIFlow.ts.bak
mv src/routes/productImageGenerator.ts src/routes/productImageGenerator.ts.bak
mv src/routes/video.ts src/routes/video.ts.bak

# Then build and deploy
npm run build
pm2 restart ai-image-backend
```

##### 🔧 **Run with ts-node (Development Mode)**
```bash
# If build fails, run directly with ts-node:
pm2 stop ai-image-backend
pm2 start "npx ts-node src/server.ts" --name ai-image-backend
```

### 9. **EXPRESS RATE LIMITING ERRORS**

#### ❌ **Error: X-Forwarded-For Header Issue**
```bash
# If you see: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false
# Fix: Add trust proxy to server.ts before rate limiting:

# In src/server.ts, add after const app = express();:
app.set('trust proxy', 1);

# Before app.use(limiter);
```

#### 🔧 **Quick Fix for Rate Limiting:**
```bash
# Add trust proxy to server.ts
sed -i '/const app = express();/a\\n// Trust proxy for rate limiting\napp.set("trust proxy", 1);' src/server.ts
```

### 10. **EMERGENCY DEPLOYMENT (When Build Fails)**

#### 🚨 **Quick Deploy Without Build:**
```bash
# 1. Backup current state
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# 2. Pull latest code
git pull origin main

# 3. Install dependencies
npm install

# 4. Generate Prisma client
npx prisma generate

# 5. Push schema to database
npx prisma db push

# 6. Disable problematic files temporarily
mv src/middleware/passport.ts src/middleware/passport.ts.bak 2>/dev/null || true
mv src/routes/productAIFlow.ts src/routes/productAIFlow.ts.bak 2>/dev/null || true
mv src/routes/productImageGenerator.ts src/routes/productImageGenerator.ts.bak 2>/dev/null || true
mv src/routes/video.ts src/routes/video.ts.bak 2>/dev/null || true

# 7. Run with ts-node
pm2 stop ai-image-backend
pm2 start "npx ts-node src/server.ts" --name ai-image-backend

# 8. Check logs
pm2 logs ai-image-backend --lines 20
```

### 11. **POST-DEPLOYMENT VERIFICATION**

#### ✅ **Check App Status:**
```bash
# Check PM2 status
pm2 status

# Check logs for errors
pm2 logs ai-image-backend --lines 50

# Test API endpoints
curl http://localhost:3001/api/health
curl https://api.tikminer.info/api/health

# Check database connection
npx prisma db push
```

#### ✅ **Monitor for Common Issues:**
```bash
# Check for rate limiting errors
pm2 logs ai-image-backend | grep -i "rate.*limit"

# Check for database errors
pm2 logs ai-image-backend | grep -i "database\|prisma"

# Check for TypeScript errors
pm2 logs ai-image-backend | grep -i "typescript\|ts"
```

## 📝 **REMEMBER**

1. **ALWAYS** backup production .env before pulling code
2. **ALWAYS** check Prisma schema has `env("DATABASE_URL")` not hardcoded path
3. **ALWAYS** verify database connection points to production database
4. **ALWAYS** test API endpoints after deployment
5. **NEVER** deploy without running the checklist above
6. **ALWAYS** add `app.set('trust proxy', 1);` for production with reverse proxy
7. **ALWAYS** check TypeScript compilation before building
8. **ALWAYS** have a fallback plan (ts-node) if build fails
9. **ALWAYS** monitor logs after deployment
10. **NEVER** ignore TypeScript errors - fix them or disable files temporarily

---
**Last Updated:** 2025-09-30
**Author:** AI Assistant
