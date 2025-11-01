# 🗂️ Shell Scripts Analysis & Cleanup Plan

## 📊 Current Shell Scripts (11 files)

### Root Directory (10 files)

| File | Purpose | Status | Recommendation |
|------|---------|--------|----------------|
| `deploy.sh` | Main deployment script | ✅ **KEEP** | Core deployment tool |
| `deploy-production-safe.sh` | Safe production deployment | ✅ **KEEP** | Important for safety |
| `emergency-deploy.sh` | Emergency fixes | ✅ **KEEP** | Needed for emergencies |
| `pre-deploy-check.sh` | Pre-deployment validation | ✅ **KEEP** | Prevents deployment errors |
| `deploy-to-server.sh` | Deploy to specific server | ⚠️ **DUPLICATE** | Similar to deploy.sh |
| `deploy-multi-apps.sh` | Multi-app deployment | ⚠️ **OPTIONAL** | Only if running multiple apps |
| `manage-multi-apps.sh` | Manage multiple apps | ⚠️ **OPTIONAL** | Only if running multiple apps |
| `update-deploy.sh` | Update deployment | ❌ **DELETE** | Unclear purpose, likely outdated |
| `check-server.sh` | Check server status | ✅ **KEEP** | Useful for monitoring |

### Backend Directory (2 files)

| File | Purpose | Status | Recommendation |
|------|---------|--------|----------------|
| `backend/check-prisma-migration.sh` | Check Prisma migrations | ✅ **KEEP** | Important for DB safety |
| `backend/deploy-with-check.sh` | Deploy with checks | ⚠️ **DUPLICATE** | Redundant with pre-deploy-check.sh |

## 🎯 Cleanup Plan

### ✅ Keep (7 files) - Essential Tools
1. `deploy.sh` - Main deployment
2. `deploy-production-safe.sh` - Safe deployment
3. `emergency-deploy.sh` - Emergency fixes
4. `pre-deploy-check.sh` - Validation
5. `check-server.sh` - Monitoring
6. `backend/check-prisma-migration.sh` - DB safety

### 🗑️ Delete (4 files) - Duplicates/Outdated
1. `deploy-to-server.sh` - Duplicate of deploy.sh
2. `update-deploy.sh` - Unclear, likely outdated
3. `backend/deploy-with-check.sh` - Duplicate functionality
4. `deploy-multi-apps.sh` - Not needed (single app)
5. `manage-multi-apps.sh` - Not needed (single app)

## 📁 Proposed Organization

Create `scripts/` folder:

```
scripts/
├── deployment/
│   ├── deploy.sh                    # Main deployment
│   ├── deploy-production-safe.sh    # Safe deployment
│   ├── emergency-deploy.sh          # Emergency
│   └── pre-deploy-check.sh          # Validation
├── monitoring/
│   └── check-server.sh              # Server monitoring
└── database/
    └── check-prisma-migration.sh    # DB checks
```

## 🔧 Recommended Actions

### Step 1: Create Scripts Folder
```bash
mkdir -p scripts/{deployment,monitoring,database}
```

### Step 2: Move Essential Scripts
```bash
# Deployment scripts
mv deploy.sh scripts/deployment/
mv deploy-production-safe.sh scripts/deployment/
mv emergency-deploy.sh scripts/deployment/
mv pre-deploy-check.sh scripts/deployment/

# Monitoring
mv check-server.sh scripts/monitoring/

# Database
mv backend/check-prisma-migration.sh scripts/database/
```

### Step 3: Delete Unnecessary Scripts
```bash
rm -f deploy-to-server.sh
rm -f update-deploy.sh
rm -f deploy-multi-apps.sh
rm -f manage-multi-apps.sh
rm -f backend/deploy-with-check.sh
```

### Step 4: Create Scripts README
Create `scripts/README.md` with usage instructions.

## 📝 Quick Reference Guide

After cleanup, you'll have:

**Deployment:**
- `scripts/deployment/deploy.sh` - Normal deployment
- `scripts/deployment/deploy-production-safe.sh` - Production deployment
- `scripts/deployment/emergency-deploy.sh` - Quick fixes
- `scripts/deployment/pre-deploy-check.sh` - Validation before deploy

**Monitoring:**
- `scripts/monitoring/check-server.sh` - Check server health

**Database:**
- `scripts/database/check-prisma-migration.sh` - Verify migrations

## ⚠️ Before Deleting

Check if these scripts are referenced in:
- PM2 ecosystem files
- Cron jobs
- CI/CD pipelines
- Other scripts
- Documentation

---
**Total Reduction**: 11 files → 6 files (45% reduction)
**Organization**: Root clutter → Clean scripts/ folder

