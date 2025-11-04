# ⚡ Quick Deploy Guide - Version 2.0.0

**Status:** ✅ READY FOR PRODUCTION  
**Version:** 2.0.0  
**Date:** January 4, 2025

---

## 🚀 One-Command Deployment

### Option 1: PM2 (Recommended)

```bash
cd /Users/vophuong/Documents/AIImage && \
git pull origin main && \
cd backend && npm install && npm run build && \
cd ../frontend && npm install && npm run build && \
cd .. && pm2 restart all && pm2 save && \
echo "✅ Deployment complete! Version 2.0.0 is live."
```

### Option 2: Docker

```bash
cd /Users/vophuong/Documents/AIImage && \
docker-compose down && \
git pull origin main && \
docker-compose -f docker-compose.prod.yml up -d --build && \
echo "✅ Deployment complete! Version 2.0.0 is live."
```

---

## ✅ Quick Verification

```bash
# Check services
pm2 status

# Test API
curl http://localhost:3001/api/health

# Check logs
pm2 logs --lines 50 --nostream
```

**Expected Results:**
- All PM2 apps: `status: online`
- Health check: `{"status":"ok"}`
- No errors in logs

---

## 🔄 Quick Rollback (If Needed)

```bash
cd /Users/vophuong/Documents/AIImage && \
pm2 stop all && \
git checkout v1.0.0 && \
cd backend && npm install && npm run build && \
cd ../frontend && npm install && npm run build && \
cd .. && pm2 restart all && \
echo "⚠️  Rolled back to v1.0.0"
```

---

## 📋 What's New in 2.0.0?

### ⭐ Major Features

1. **Centralized AI Models Config**
   - File: `backend/src/config/aiModels.ts`
   - Change any AI model in one place
   - All 10 APIs updated

2. **Simplified Multilingual**
   - Removed complex language mapping
   - AI auto-detects language
   - Support 25+ markets

3. **Bug Fixes**
   - Korean (ko-KR) working ✅
   - All Asian languages fixed ✅

### 📄 New Files

```
✅ CHANGELOG.md
✅ RELEASE_NOTES_v2.0.0.md
✅ PRE_DEPLOYMENT_CHECKLIST.md
✅ DEPLOYMENT_SUMMARY_v2.0.0.md
✅ VERSION
✅ backend/src/config/aiModels.ts
✅ backend/src/config/README.md
```

---

## 🎯 Post-Deploy Checklist

```bash
# 1. Check all services
pm2 status
# Expected: All "online"

# 2. Test health
curl http://localhost:3001/api/health
# Expected: {"status":"ok"}

# 3. Test AI models
curl -X POST http://localhost:3001/api/product-optimize/suggest-data \
  -H "Content-Type: application/json" \
  -d '{"product_title":"Test","product_description":"Test"}'
# Expected: JSON response

# 4. Test multilingual (Korean)
curl -X POST http://localhost:3001/api/product-optimize/generate-content-from-segmentation \
  -H "Content-Type: application/json" \
  -d '{"productTitle":"Test","selectedSegment":{"name":"Test"},"targetMarket":"kr","language":"ko-KR"}'
# Expected: Korean content

# 5. Monitor for 30 minutes
pm2 logs --lines 100
```

---

## 🔐 Before Deploy

### 1. Backup Database

```bash
# PostgreSQL
pg_dump aiimage > backup_v2.0.0_$(date +%Y%m%d_%H%M%S).sql

# SQLite
cp prisma/dev.db prisma/dev.db.backup_v2.0.0
```

### 2. Create Git Tag

```bash
git tag -a v1.0.0-backup -m "Backup before v2.0.0"
git push origin v1.0.0-backup
```

### 3. Save PM2 State

```bash
pm2 save
```

---

## 📞 Emergency

### If Something Goes Wrong

**Immediate Rollback:**
```bash
cd /Users/vophuong/Documents/AIImage && ./quick-rollback.sh
```

Or use the rollback command above.

**Support Contacts:**
- Lead Developer: [Your contact]
- DevOps: [Your contact]

---

## 📊 Success Criteria

✅ PM2 all processes "online"  
✅ Health check returns 200 OK  
✅ No critical errors in logs  
✅ All APIs respond  
✅ Korean/multilingual working  

---

## 🎉 Ready to Deploy!

**All checks passed. Version 2.0.0 is production ready.**

**Deploy now:**
```bash
cd /Users/vophuong/Documents/AIImage && \
git pull origin main && \
cd backend && npm install && npm run build && \
cd ../frontend && npm install && npm run build && \
cd .. && pm2 restart all && pm2 save
```

**Then verify:**
```bash
pm2 status && curl http://localhost:3001/api/health
```

---

## 📚 Full Documentation

- **Detailed Guide:** `PRE_DEPLOYMENT_CHECKLIST.md`
- **Release Notes:** `RELEASE_NOTES_v2.0.0.md`
- **Changes:** `CHANGELOG.md`
- **Summary:** `DEPLOYMENT_SUMMARY_v2.0.0.md`

---

**Good luck with deployment! 🚀**

*Last Updated: January 4, 2025*

