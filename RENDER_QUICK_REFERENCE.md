# Render Deployment Quick Reference

## 🎯 Quick Start Checklist

- [ ] Create Render account
- [ ] Connect GitHub repository
- [ ] Review `render.yaml` configuration
- [ ] Customize regions and plans
- [ ] Deploy via Blueprint
- [ ] Set environment variables
- [ ] Test all services
- [ ] Configure custom domains (optional)

## 📋 Service Configuration Summary

| Service   | Root Directory   | Port | Build Command                            | Start Command                              |
| --------- | ---------------- | ---- | ---------------------------------------- | ------------------------------------------ |
| API       | `apps/api`       | 3000 | `npm install && npm run build`           | `npm run start:prod`                       |
| Web       | `apps/web`       | 3000 | `npm install && npm run build`           | `npm run start`                            |
| Docs      | `apps/docs`      | 3001 | `npm install && npm run build`           | `npm run start`                            |
| Storybook | `apps/storybook` | 3002 | `npm install && npm run build-storybook` | `npx http-server storybook-static -p 3002` |

## 🔧 Environment Variables Required

### blenvi-web

```bash
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### blenvi-api

```bash
NODE_ENV=production
PORT=3000
# Add your database connection strings and API keys
DATABASE_URL=<your-database-url>
```

### blenvi-docs & blenvi-storybook

```bash
NODE_ENV=production
PORT=3001  # or 3002 for storybook
```

## 🔄 Build Filter Patterns

### API Service

```yaml
- apps/api/**
- packages/**
- package.json
- package-lock.json
- turbo.json
```

### Web Service

```yaml
- apps/web/**
- packages/ui/**
- packages/typescript-config/**
- packages/eslint-config/**
- package.json
- package-lock.json
- turbo.json
```

### Docs Service

```yaml
- apps/docs/**
- packages/typescript-config/**
- packages/eslint-config/**
- package.json
- package-lock.json
- turbo.json
```

### Storybook Service

```yaml
- apps/storybook/**
- packages/ui/**
- packages/typescript-config/**
- packages/eslint-config/**
- package.json
- package-lock.json
- turbo.json
```

## 📍 Available Regions

- `oregon` (US West)
- `ohio` (US East)
- `frankfurt` (Europe)
- `singapore` (Asia)

Choose the region closest to your users for best performance.

## 💵 Service Plans

| Plan       | Price   | Use Case              |
| ---------- | ------- | --------------------- |
| `free`     | $0      | Development, testing  |
| `starter`  | $7/mo   | Small production apps |
| `standard` | $25/mo  | Growing apps          |
| `pro`      | $85/mo  | High-traffic apps     |
| `pro plus` | $185/mo | Enterprise apps       |

## 🚀 Deployment Commands

### Deploy from Blueprint

```bash
# Commit your render.yaml
git add render.yaml
git commit -m "Add Render deployment configuration"
git push origin main

# Then sync in Render Dashboard
```

### Update render.yaml

```bash
# Make changes to render.yaml
git add render.yaml
git commit -m "Update Render configuration"
git push origin main

# Sync blueprint in Render Dashboard
```

## 🔍 Common Render CLI Commands

Install Render CLI:

```bash
npm install -g render
```

Login:

```bash
render login
```

List services:

```bash
render services list
```

View logs:

```bash
render logs <service-name>
```

Deploy manually:

```bash
render deploy <service-name>
```

## 🐛 Troubleshooting Commands

### Check if service is running

```bash
curl https://your-service.onrender.com/
```

### Test API endpoint

```bash
curl https://blenvi-api.onrender.com/health
```

### View build logs

Go to Render Dashboard → Service → Events → Select deploy → View logs

### Restart service

Render Dashboard → Service → Manual Deploy → Deploy latest commit

## 🔗 Useful Links

- **Dashboard**: https://dashboard.render.com/
- **API Docs**: https://api-docs.render.com/
- **Status Page**: https://status.render.com/
- **Community**: https://community.render.com/
- **Documentation**: https://render.com/docs

## 📊 Monitoring Endpoints

Add these health check endpoints to your services:

### API (NestJS)

```typescript
// src/health/health.controller.ts
@Get('health')
check() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}
```

### Web (Next.js)

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

## 🔐 Security Checklist

- [ ] All secrets in environment variables (not in code)
- [ ] HTTPS enabled (automatic with Render)
- [ ] CORS configured for API
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection protection
- [ ] XSS protection enabled
- [ ] CSP headers configured

## 🎨 Optional Configurations

### Add PostgreSQL Database

```yaml
databases:
  - name: blenvi-postgres
    region: oregon
    plan: starter
    databaseName: blenvi
    user: blenvi
```

### Add Redis

```yaml
services:
  - type: redis
    name: blenvi-redis
    region: oregon
    plan: starter
    maxmemoryPolicy: allkeys-lru
```

### Add Cron Job

```yaml
services:
  - type: cron
    name: blenvi-cleanup
    schedule: '0 0 * * *' # Daily at midnight
    buildCommand: npm install
    startCommand: npm run cleanup
    rootDir: apps/api
```

## 📱 Preview Environments

Enable preview environments for pull requests:

1. Go to Service → Settings
2. Enable "Preview Environments"
3. Each PR will get a unique URL
4. Automatically deploys and tears down

## 🔄 Rollback Procedure

If deployment fails or has issues:

1. Go to Service → Events
2. Find the previous successful deploy
3. Click "Rollback to this version"
4. Confirm rollback

## 💡 Pro Tips

1. **Use build filters** to avoid unnecessary deploys
2. **Set up health checks** for all services
3. **Monitor build times** and optimize if needed
4. **Use environment groups** for shared configs
5. **Enable auto-deploy** for main branch only
6. **Use preview environments** for testing PRs
7. **Set up notifications** for deploy failures
8. **Document your API** with OpenAPI/Swagger
9. **Use staging environment** before production
10. **Monitor logs** regularly for issues

## 📈 Performance Optimization

### Reduce Build Times

- Use build caching
- Minimize dependencies
- Optimize Docker images
- Use turbo for monorepo builds

### Reduce Cold Starts

- Upgrade from free tier
- Use starter plan or higher
- Keep services warm with health checks

### Optimize Response Times

- Use CDN for static assets
- Enable compression
- Optimize database queries
- Use caching strategies

---

**Need Help?** Check the [full deployment guide](./DEPLOYMENT.md) for detailed instructions.
