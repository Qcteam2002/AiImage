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

# 8. Build frontend
cd ../frontend
npm install
npm run build

# 9. Restart PM2
cd ../backend
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

#### ❌ **MISTAKE 4: Frontend-Backend Interface Mismatch**
```bash
# ❌ WRONG - Updating backend schema without updating frontend interface
# This causes TypeScript build errors like:
# Property 'language' does not exist on type 'CreateProductAffRequest'

# ✅ CORRECT - Always update both frontend and backend together
# 1. Update backend schema
# 2. Update frontend interface
# 3. Test builds locally
# 4. Push both changes
# 5. Deploy together
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

# Build frontend
cd ../frontend
npm install
npm run build

# Restart PM2
cd ../backend
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

##### ❌ **Error: Frontend-Backend Interface Mismatch**
```bash
# If you see: Property 'language' does not exist on type 'CreateProductAffRequest'
# This happens when backend schema is updated but frontend interface is not

# ✅ SOLUTION: Always update frontend interface when backend changes
# 1. Update frontend/src/services/productAffService.ts
# 2. Add missing fields to interfaces
# 3. Push to Git
# 4. Pull on server
# 5. Build frontend
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

### 12. **FRONTEND-BACKEND INTERFACE MISMATCH ERRORS**

#### ❌ **Error: TypeScript Interface Mismatch**
```bash
# If you see: Property 'language' does not exist on type 'CreateProductAffRequest'
# This happens when backend schema is updated but frontend interface is not

# ✅ SOLUTION: Always update frontend interface when backend changes
# 1. Update frontend/src/services/productAffService.ts
# 2. Add missing fields to interfaces
# 3. Push to Git
# 4. Pull on server
# 5. Build frontend
```

#### 🔧 **Quick Fix for Interface Mismatch:**
```bash
# 1. Check what fields are missing
cd frontend
npm run build 2>&1 | grep -i "does not exist"

# 2. Update interface in src/services/productAffService.ts
# Add missing fields like:
# language?: string;
# segmentation_number?: number;

# 3. Push changes
git add .
git commit -m "Fix TypeScript interface mismatch"
git push origin main

# 4. On server, pull and build
git pull origin main
cd frontend
npm run build
```

### 13. **SCHEMA MIGRATION ERRORS**

#### ❌ **Error: Column does not exist in current database**
```bash
# If you see: The column `main.product_aff.language` does not exist
# This happens when Prisma schema is updated but database is not synced

# ✅ SOLUTION: Always run prisma db push after schema changes
npx prisma db push
npx prisma generate
npm run build
```

#### 🔧 **Complete Schema Update Process:**
```bash
# 1. Update prisma/schema.prisma
# 2. Generate Prisma client
npx prisma generate

# 3. Push schema to database
npx prisma db push

# 4. Build backend
npm run build

# 5. Update frontend interfaces
# 6. Build frontend
cd ../frontend
npm run build

# 7. Restart PM2
pm2 restart ai-image-backend
```

### 14. **GIT CONFLICT RESOLUTION**

#### ❌ **Error: Your local changes would be overwritten by merge**
```bash
# If you see: error: Your local changes to the following files would be overwritten by merge

# ✅ SOLUTION: Stash local changes before pulling
git stash
git pull origin main
git stash pop  # If you need the stashed changes
```

#### 🔧 **Safe Git Pull Process:**
```bash
# 1. Check for local changes
git status

# 2. If there are local changes, stash them
git stash

# 3. Pull latest code
git pull origin main

# 4. If you need stashed changes, apply them
git stash pop

# 5. Resolve any conflicts if they occur
# 6. Commit resolved changes
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

### 15. **PRODUCTION DEPLOYMENT CHECKLIST (UPDATED)**

```bash
# ✅ COMPLETE DEPLOYMENT CHECKLIST:

# 1. Backup production environment
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# 2. Check for local changes and stash if needed
git status
git stash  # If there are local changes

# 3. Pull latest code
git pull origin main

# 4. Check Prisma schema
cat prisma/schema.prisma | grep -A 3 datasource

# 5. Install dependencies
npm install

# 6. Generate Prisma client
npx prisma generate

# 7. Push schema to PRODUCTION database
npx prisma db push

# 8. Build backend
npm run build

# 9. Build frontend
cd ../frontend
npm install
npm run build

# 10. Restart PM2
cd ../backend
pm2 restart ai-image-backend
pm2 logs ai-image-backend --lines 20
```

### 16. **COMMON DEPLOYMENT FAILURES & SOLUTIONS**

#### ❌ **Failure: Frontend Build Fails with TypeScript Errors**
```bash
# Cause: Interface mismatch between frontend and backend
# Solution: Update frontend interfaces and rebuild

# 1. Check TypeScript errors
cd frontend
npm run build

# 2. Update interfaces in src/services/productAffService.ts
# 3. Push changes
git add .
git commit -m "Fix TypeScript interface mismatch"
git push origin main

# 4. On server, pull and rebuild
git pull origin main
npm run build
```

#### ❌ **Failure: Backend Build Fails with Missing Dependencies**
```bash
# Cause: Missing packages or outdated Prisma client
# Solution: Clean install and regenerate

# 1. Clean install
rm -rf node_modules package-lock.json
npm install

# 2. Regenerate Prisma client
npx prisma generate

# 3. Build
npm run build
```

#### ❌ **Failure: Database Schema Mismatch**
```bash
# Cause: Prisma schema updated but database not synced
# Solution: Force push schema to database

# 1. Force push schema
npx prisma db push --force-reset

# 2. Regenerate client
npx prisma generate

# 3. Build and restart
npm run build
pm2 restart ai-image-backend
```

### 17. **PRE-DEPLOYMENT VALIDATION**

#### ✅ **Local Validation Before Push:**
```bash
# 1. Test backend build
cd backend
npm run build

# 2. Test frontend build
cd ../frontend
npm run build

# 3. Test Prisma schema
cd ../backend
npx prisma generate
npx prisma db push

# 4. If all pass, push to Git
git add .
git commit -m "Ready for production deployment"
git push origin main
```

#### ✅ **Server Validation After Pull:**
```bash
# 1. Check Prisma schema
cat prisma/schema.prisma | grep -A 3 datasource

# 2. Check environment
cat .env | grep DATABASE_URL

# 3. Test builds
npm run build
cd ../frontend
npm run build

# 4. If all pass, restart services
cd ../backend
pm2 restart ai-image-backend
```

### 18. **EMERGENCY ROLLBACK PROCEDURES**

#### 🚨 **Quick Rollback When Deployment Fails:**
```bash
# 1. Stop current app
pm2 stop ai-image-backend

# 2. Restore backup .env
cp .env.backup.$(date +%Y%m%d_%H%M%S) .env

# 3. Rollback to previous commit
git reset --hard HEAD~1

# 4. Clean install
rm -rf node_modules package-lock.json
npm install

# 5. Regenerate Prisma client
npx prisma generate

# 6. Build and restart
npm run build
pm2 start ai-image-backend
```

#### 🚨 **Partial Rollback (Keep Database, Rollback Code):**
```bash
# 1. Stop app
pm2 stop ai-image-backend

# 2. Rollback code only
git reset --hard HEAD~1

# 3. Keep current .env and database
# 4. Rebuild and restart
npm run build
pm2 start ai-image-backend
```

### 19. **MONITORING & DEBUGGING**

#### ✅ **Post-Deployment Monitoring:**
```bash
# 1. Check PM2 status
pm2 status

# 2. Monitor logs
pm2 logs ai-image-backend --lines 50

# 3. Test API endpoints
curl http://localhost:3001/api/health
curl https://api.tikminer.info/api/health

# 4. Check database connection
npx prisma db push

# 5. Monitor for errors
pm2 logs ai-image-backend | grep -i "error\|fail\|exception"
```

#### ✅ **Common Error Patterns to Watch:**
```bash
# TypeScript errors
pm2 logs ai-image-backend | grep -i "typescript\|ts"

# Database errors
pm2 logs ai-image-backend | grep -i "database\|prisma\|sqlite"

# Interface mismatch errors
pm2 logs ai-image-backend | grep -i "does not exist\|property"

# Rate limiting errors
pm2 logs ai-image-backend | grep -i "rate.*limit"

# Memory issues
pm2 logs ai-image-backend | grep -i "memory\|heap"
```

### 20. **BEST PRACTICES FOR FUTURE DEPLOYMENTS**

#### ✅ **Always Follow This Order:**
1. **Local Development**: Make changes locally
2. **Local Testing**: Test builds and functionality
3. **Git Commit**: Commit with descriptive message
4. **Git Push**: Push to remote repository
5. **Server Pull**: Pull latest code on server
6. **Schema Update**: Run `npx prisma db push`
7. **Build Backend**: `npm run build`
8. **Build Frontend**: `cd frontend && npm run build`
9. **Restart Services**: `pm2 restart ai-image-backend`
10. **Verify**: Check logs and test endpoints

#### ✅ **Prevention Strategies:**
- Always update both frontend and backend interfaces together
- Test builds locally before pushing
- Use descriptive commit messages
- Keep production .env backed up
- Monitor logs after deployment
- Have rollback plan ready

#### ✅ **Documentation Updates:**
- Update this file when new deployment issues are discovered
- Add new error patterns and solutions
- Keep deployment checklist current
- Document any custom server configurations

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
11. **ALWAYS** update both frontend and backend interfaces together
12. **ALWAYS** test builds locally before pushing to production
13. **ALWAYS** stash local changes before pulling on server
14. **ALWAYS** run `npx prisma db push` after schema changes
15. **ALWAYS** build both frontend and backend on server

---
**Last Updated:** 2025-01-27
**Author:** AI Assistant
**Version:** 2.0