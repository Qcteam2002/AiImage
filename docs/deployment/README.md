# 🚀 Deployment Documentation

Critical deployment guides and checklists.

## ⚠️ **READ FIRST**

- **[DEPLOY_WARNING.md](./DEPLOY_WARNING.md)** - ⚠️ MUST READ BEFORE ANY DEPLOYMENT

## 📖 Deployment Guides

### Production Deployment
- **[Deployment Guide](./guide.md)** - Complete deployment walkthrough
- **[Deployment Steps](./steps.md)** - Step-by-step checklist
- **[Multi-App Deployment](./multi-apps.md)** - Deploy multiple applications

## 🔧 Deployment Scripts

Located in project root:
- `deploy.sh` - Standard deployment
- `deploy-production-safe.sh` - Safe production deployment
- `emergency-deploy.sh` - Emergency fixes
- `pre-deploy-check.sh` - Pre-deployment validation

## ✅ Pre-Deployment Checklist

1. **Backup Production**
   ```bash
   cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
   ```

2. **Check Schema**
   ```bash
   cat prisma/schema.prisma | grep -A 3 datasource
   ```

3. **Test Locally**
   ```bash
   npm run build  # Backend
   cd frontend && npm run build  # Frontend
   ```

4. **Review Changes**
   ```bash
   git log -5 --oneline
   git diff origin/main
   ```

## 🚨 Common Deployment Failures

### Frontend Build Errors
- **Cause**: TypeScript interface mismatch
- **Solution**: Update interfaces, test build locally

### Database Schema Mismatch
- **Cause**: Prisma schema updated but DB not synced
- **Solution**: `npx prisma db push`

### Git Conflicts
- **Cause**: Local changes conflict with remote
- **Solution**: `git stash` before pulling

See [DEPLOY_WARNING.md](./DEPLOY_WARNING.md) for complete failure scenarios.

## 📊 Post-Deployment Verification

```bash
# Check PM2 status
pm2 status

# Monitor logs
pm2 logs ai-image-backend --lines 50

# Test API
curl http://localhost:3001/api/health

# Check database
npx prisma db push
```

## 🔄 Rollback Procedures

```bash
# Stop app
pm2 stop ai-image-backend

# Restore .env
cp .env.backup.YYYYMMDD_HHMMSS .env

# Rollback code
git reset --hard HEAD~1

# Restart
pm2 start ai-image-backend
```

## 📝 Deployment Log

Keep a deployment log in your team docs:
- Date & Time
- Version/Commit
- Who deployed
- Issues encountered
- Resolution steps

---
**Remember**: Always backup before deploying!

