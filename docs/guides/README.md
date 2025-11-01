# 📘 Developer Guides

Practical guides for developers and users.

## 🚀 Getting Started

- **[Quick Start](./quick-start.md)** - Get up and running fast
- **[Quick Fixes](./quick-fixes.md)** - Common issues and solutions

## 🔄 Migration & Upgrades

- **[Migration Guide](./migration.md)** - Upgrade between versions
- **[API Integration Fixes](./api-integration-fixes.md)** - Fix API integration issues

## 📊 Feature Guides

- **[Product Analysis Guide](./product-analysis.md)** - How to analyze products

## 🎯 By Use Case

### For Marketers
1. Start with [Product Analysis Guide](./product-analysis.md)
2. Understand customer personas
3. Generate content and images

### For Developers
1. Read [Quick Start](./quick-start.md)
2. Check [API Documentation](../api/README.md)
3. Review [Migration Guide](./migration.md) when upgrading

### For DevOps
1. **MUST READ**: [Deployment Warning](../deployment/DEPLOY_WARNING.md)
2. Follow [Deployment Guide](../deployment/guide.md)
3. Keep [Quick Fixes](./quick-fixes.md) handy

## 🔍 Troubleshooting

### Common Issues

**API Not Responding**
- Check PM2 status: `pm2 status`
- Review logs: `pm2 logs ai-image-backend`
- Verify port: `lsof -i :3001`

**Build Failures**
- Clear cache: `rm -rf node_modules && npm install`
- Regenerate Prisma: `npx prisma generate`
- Check TypeScript: `npm run build`

**Database Issues**
- Sync schema: `npx prisma db push`
- Generate client: `npx prisma generate`
- Check connection: `cat .env | grep DATABASE_URL`

See [Quick Fixes](./quick-fixes.md) for more solutions.

## 📚 Related Resources

- [API Documentation](../api/README.md)
- [Feature Documentation](../features/README.md)
- [Deployment Guides](../deployment/README.md)

## 💡 Tips & Best Practices

### Development
- Always test locally before pushing
- Write descriptive commit messages
- Update documentation with code changes

### API Integration
- Handle errors gracefully
- Implement retry logic
- Log requests for debugging

### Database
- Backup before migrations
- Use transactions for critical operations
- Monitor query performance

---
Need help? Check the specific guide or ask the team!

