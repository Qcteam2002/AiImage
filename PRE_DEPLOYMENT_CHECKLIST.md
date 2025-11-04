# ✅ Pre-Deployment Checklist - Version 2.0.0

**Target Environment:** Production  
**Release Version:** 2.0.0  
**Release Date:** January 4, 2025

---

## 📋 Code Quality Checks

### ✅ Linting & Compilation

- [ ] **Backend linting passes**
  ```bash
  cd backend
  npm run lint
  # Expected: No errors
  ```

- [ ] **Frontend linting passes**
  ```bash
  cd frontend
  npm run lint
  # Expected: 0 errors
  ```

- [ ] **TypeScript compilation successful**
  ```bash
  cd backend && npm run build
  cd ../frontend && npm run build
  # Expected: No compilation errors
  ```

- [ ] **No console.log in production code** (except intentional logging)
  ```bash
  grep -r "console.log" backend/src --exclude-dir=node_modules
  # Review and remove debugging logs
  ```

---

## 🔧 Configuration Checks

### ✅ Environment Variables

- [ ] **Backend `.env` file exists**
  ```bash
  ls backend/.env
  ```

- [ ] **Frontend `.env` file exists** (if needed)
  ```bash
  ls frontend/.env
  ```

- [ ] **All required environment variables set**
  
  **Backend Required:**
  ```bash
  # Check these variables exist
  grep -q "OPENROUTER_API_KEY" backend/.env && echo "✓ OPENROUTER_API_KEY"
  grep -q "DATABASE_URL" backend/.env && echo "✓ DATABASE_URL"
  grep -q "JWT_SECRET" backend/.env && echo "✓ JWT_SECRET"
  grep -q "PORT" backend/.env && echo "✓ PORT"
  ```

- [ ] **No API keys in code** (all in .env)
  ```bash
  # This should return NO results
  grep -r "sk-" backend/src --exclude-dir=node_modules
  ```

### ✅ AI Models Configuration

- [ ] **Review `backend/src/config/aiModels.ts`**
  - All models are correct
  - Timeouts are reasonable (not too short/long)
  - Temperature values make sense (0.0-1.0)
  - Max tokens are appropriate

- [ ] **Verify model availability**
  - Check all models are supported by OpenRouter
  - Verify you have access to premium models (if used)

---

## 🗄️ Database Checks

### ✅ Database Migration

- [ ] **Prisma schema is up to date**
  ```bash
  cd backend
  npx prisma generate
  ```

- [ ] **Database migrations applied**
  ```bash
  npm run db:push
  # OR
  npm run db:migrate
  ```

- [ ] **Database connection works**
  ```bash
  npx prisma db pull
  # Should connect successfully
  ```

- [ ] **Database backup created** (before deployment)
  ```bash
  # For PostgreSQL
  pg_dump your_database > backup_v2.0.0_$(date +%Y%m%d).sql
  
  # For SQLite (if using)
  cp prisma/dev.db prisma/dev.db.backup_v2.0.0
  ```

---

## 📦 Dependencies

### ✅ Backend Dependencies

- [ ] **Install production dependencies**
  ```bash
  cd backend
  npm install --production
  ```

- [ ] **No vulnerable dependencies**
  ```bash
  npm audit
  # Fix any high/critical vulnerabilities
  ```

- [ ] **Outdated packages reviewed**
  ```bash
  npm outdated
  # Update if needed, test thoroughly
  ```

### ✅ Frontend Dependencies

- [ ] **Install production dependencies**
  ```bash
  cd frontend
  npm install --production
  ```

- [ ] **No vulnerable dependencies**
  ```bash
  npm audit
  ```

---

## 🧪 Testing

### ✅ API Testing

- [ ] **Backend server starts**
  ```bash
  cd backend
  npm run dev
  # Should start without errors
  ```

- [ ] **Health check passes**
  ```bash
  curl http://localhost:3001/api/health
  # Expected: { "status": "ok" }
  ```

- [ ] **Test AI models config**
  ```bash
  # Test suggest-data API
  curl -X POST http://localhost:3001/api/product-optimize/suggest-data \
    -H "Content-Type: application/json" \
    -d '{
      "product_title": "Test Product",
      "product_description": "Test description"
    }'
  # Should return suggestions
  ```

- [ ] **Test alt text generation** (new feature)
  ```bash
  curl -X POST http://localhost:3001/api/product-optimize/generate-alt-text \
    -H "Content-Type: application/json" \
    -d '{
      "productTitle": "Test Earrings",
      "images": [
        {"id": "test-1", "url": "https://example.com/image.jpg"}
      ],
      "targetMarket": "us",
      "language": "en-US"
    }'
  # Should return alt text
  ```

- [ ] **Test content generation with segmentation**
  ```bash
  curl -X POST http://localhost:3001/api/product-optimize/generate-content-from-segmentation \
    -H "Content-Type: application/json" \
    -d '{
      "productTitle": "Test Product",
      "selectedSegment": {"name": "Test Segment"},
      "targetMarket": "us",
      "language": "ko-KR"
    }'
  # Should return Korean content
  ```

### ✅ Frontend Testing

- [ ] **Frontend builds successfully**
  ```bash
  cd frontend
  npm run build
  # Check dist/ folder created
  ```

- [ ] **Frontend preview works**
  ```bash
  npm run preview
  # Open http://localhost:4173 and test
  ```

- [ ] **No console errors in browser**
  - Open DevTools
  - Navigate through main pages
  - Check for JavaScript errors

---

## 📝 Documentation

### ✅ Documentation Complete

- [ ] **CHANGELOG.md updated**
  - Contains all changes for v2.0.0
  - Links work

- [ ] **RELEASE_NOTES_v2.0.0.md created**
  - Clear and comprehensive
  - Migration guide included

- [ ] **API documentation updated**
  - All new endpoints documented
  - Request/response examples provided

- [ ] **README.md is current**
  - Version number updated
  - Installation steps correct
  - Links working

---

## 🚀 Deployment Preparation

### ✅ Deployment Scripts

- [ ] **Deployment script tested**
  ```bash
  # Test on staging first
  ./deploy-production-safe.sh --dry-run
  ```

- [ ] **PM2 ecosystem config updated**
  ```bash
  cat ecosystem.config.js
  # Verify all apps listed correctly
  ```

### ✅ Server Checks

- [ ] **Server disk space sufficient**
  ```bash
  df -h
  # Ensure >5GB free
  ```

- [ ] **Server memory adequate**
  ```bash
  free -h
  # Ensure >2GB free RAM
  ```

- [ ] **Node.js version correct**
  ```bash
  node --version
  # Should be v18+ or v20+
  ```

- [ ] **PM2 installed**
  ```bash
  pm2 --version
  ```

### ✅ Backup Strategy

- [ ] **Database backup created**
  - Date: _______________
  - Location: _______________
  - Verified: Yes / No

- [ ] **Code backup (git tag)**
  ```bash
  git tag -a v2.0.0 -m "Release version 2.0.0"
  git push origin v2.0.0
  ```

- [ ] **Previous version deployable (rollback plan)**
  ```bash
  git tag  # Check v1.x.x exists
  ```

---

## 🔐 Security

### ✅ Security Checks

- [ ] **No hardcoded secrets**
  ```bash
  # Search for potential secrets
  grep -rE "(password|secret|api[_-]?key)" backend/src --exclude-dir=node_modules
  # Review results - should only be env var names
  ```

- [ ] **CORS configured correctly**
  ```bash
  grep -A 5 "cors(" backend/src/server.ts
  # Verify allowed origins
  ```

- [ ] **Rate limiting enabled**
  ```bash
  grep -A 5 "rateLimit" backend/src/server.ts
  ```

- [ ] **Helmet security headers enabled**
  ```bash
  grep "helmet" backend/src/server.ts
  ```

### ✅ Access Control

- [ ] **API keys have appropriate permissions**
  - OpenRouter API key valid and funded
  - Rate limits understood

- [ ] **Database credentials secure**
  - Strong password
  - Not shared

---

## 🌐 Infrastructure

### ✅ DNS & Networking

- [ ] **Domain configured** (if applicable)
  - DNS records point to correct server
  - SSL certificate valid

- [ ] **Firewall rules correct**
  - Port 3000 (frontend) accessible
  - Port 3001 (backend) accessible
  - Or reverse proxy configured

### ✅ Monitoring

- [ ] **Logging configured**
  - PM2 logs accessible
  - Log rotation enabled

- [ ] **Monitoring tools ready** (if used)
  - Uptime monitoring
  - Error tracking (Sentry, etc.)
  - Performance monitoring

---

## 📊 Performance

### ✅ Optimization

- [ ] **Production build optimized**
  ```bash
  # Check build size
  du -sh backend/dist
  du -sh frontend/dist
  ```

- [ ] **Static assets compressed** (if using nginx)
  - Gzip enabled
  - Cache headers set

- [ ] **Database indexes created**
  - Check Prisma schema for indexes
  - Create additional if needed

---

## 🎯 Final Checks

### ✅ Before Deployment

- [ ] **Announcement prepared**
  - Notify team
  - Notify users (if needed)
  - Estimated downtime (if any)

- [ ] **Rollback plan ready**
  - Know how to revert to v1.x.x
  - Database rollback script (if schema changed)

- [ ] **Support team briefed**
  - New features explained
  - Known issues documented
  - Contact info for emergency

### ✅ Deployment Timing

- [ ] **Deploy during low-traffic hours**
  - Ideal: Late evening or early morning
  - Avoid: Peak business hours

- [ ] **Team availability**
  - Developer on standby
  - Ability to rollback if needed

---

## ✅ Deployment Execution

### Step-by-Step

1. [ ] **Stop current services**
   ```bash
   pm2 stop all
   ```

2. [ ] **Pull latest code**
   ```bash
   git pull origin main
   git checkout v2.0.0  # or main
   ```

3. [ ] **Install dependencies**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

4. [ ] **Run database migrations**
   ```bash
   cd backend && npm run db:deploy
   ```

5. [ ] **Build applications**
   ```bash
   cd backend && npm run build
   cd ../frontend && npm run build
   ```

6. [ ] **Restart services**
   ```bash
   pm2 restart all
   pm2 save
   ```

7. [ ] **Verify deployment**
   ```bash
   # Check all apps running
   pm2 status
   
   # Check logs for errors
   pm2 logs --lines 50
   
   # Test API
   curl http://localhost:3001/api/health
   ```

---

## 🎉 Post-Deployment

### ✅ Verification

- [ ] **All services running**
  ```bash
  pm2 status
  # All apps should be "online"
  ```

- [ ] **No errors in logs**
  ```bash
  pm2 logs --lines 100 --nostream
  ```

- [ ] **Test critical endpoints**
  - Health check
  - Auth endpoints
  - Main APIs

- [ ] **Frontend accessible**
  - Open in browser
  - Test main features
  - Check console for errors

### ✅ Monitoring

- [ ] **Monitor for 30 minutes**
  - Watch logs for errors
  - Check memory/CPU usage
  - Test various API endpoints

- [ ] **Check error rates**
  - No unusual spike in errors
  - Response times normal

### ✅ Communication

- [ ] **Announce successful deployment**
  - Notify team
  - Update status page (if applicable)

- [ ] **Document any issues**
  - Known issues
  - Workarounds
  - Future fixes

---

## 🚨 Rollback Plan

**If deployment fails:**

```bash
# 1. Stop all services
pm2 stop all

# 2. Checkout previous version
git checkout v1.0.0

# 3. Restore dependencies
cd backend && npm install
cd ../frontend && npm install

# 4. Rebuild
cd backend && npm run build
cd ../frontend && npm run build

# 5. Restore database (if needed)
# Restore from backup_v2.0.0_*.sql

# 6. Restart services
pm2 restart all

# 7. Verify rollback
curl http://localhost:3001/api/health
pm2 logs --lines 50
```

---

## 📞 Emergency Contacts

**In case of critical issues:**

- **Lead Developer:** _______________
- **DevOps:** _______________
- **On-call Support:** _______________

---

## ✅ Deployment Sign-off

**Prepared by:** _______________  
**Date:** _______________  

**Reviewed by:** _______________  
**Date:** _______________  

**Approved by:** _______________  
**Date:** _______________  

---

**All checks completed? → READY FOR PRODUCTION DEPLOYMENT! 🚀**

