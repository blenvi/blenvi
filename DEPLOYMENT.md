# Deploying Blenvi Monorepo to Render

This guide explains how to deploy the Blenvi monorepo to Render using Infrastructure as Code with the `render.yaml` blueprint.

## 📋 Prerequisites

- A [Render account](https://dashboard.render.com/register)
- Your GitHub/GitLab/Bitbucket repository connected to Render
- Node.js 18+ (specified in `package.json`)

## 🏗️ Architecture Overview

The monorepo contains 4 deployable applications:

1. **blenvi-api** - NestJS backend API (apps/api)
2. **blenvi-web** - Next.js web application (apps/web)
3. **blenvi-docs** - Fumadocs documentation site (apps/docs)
4. **blenvi-storybook** - Storybook component library (apps/storybook)

Each service is configured with:

- **Root Directory**: Points to the specific app folder
- **Build Filters**: Only triggers deployments when relevant files change
- **Independent Scaling**: Each service can scale independently

## 🚀 Deployment Methods

### Option 1: Using render.yaml Blueprint (Recommended)

This is the Infrastructure as Code approach that manages all services from a single file.

#### Step 1: Configure render.yaml

The `render.yaml` file is already configured at the root of the repository. Review and customize:

```yaml
services:
  - type: web
    name: blenvi-api
    rootDir: apps/api
    # ... configuration
```

**Important configurations to customize:**

1. **Region**: Change `oregon` to your preferred region (`oregon`, `frankfurt`, `singapore`)
2. **Plan**: Update based on your needs (`free`, `starter`, `standard`, `pro`)
3. **Environment Variables**: Add your specific values in the Render Dashboard

#### Step 2: Connect Repository to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub/GitLab repository
4. Select the repository containing this monorepo
5. Render will detect the `render.yaml` file

#### Step 3: Configure Environment Variables

Set the following environment variables in the Render Dashboard for each service:

**For blenvi-web:**

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (keep secret)

**For blenvi-api:**

- Add any database connection strings
- Add API keys and secrets

#### Step 4: Deploy

1. Review the services that will be created
2. Click **"Apply"** to create all services
3. Render will build and deploy all services automatically

#### Step 5: Sync Future Changes

To update services after modifying `render.yaml`:

1. Commit and push changes to your repository
2. Go to Dashboard → Your Blueprint
3. Click **"Sync"** to apply changes

### Option 2: Manual Service Creation

If you prefer to create services individually:

#### For each service (API, Web, Docs, Storybook):

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your repository
4. Configure the service:

**Example for blenvi-web:**

```
Name: blenvi-web
Root Directory: apps/web
Build Command: npm install && npm run build
Start Command: npm run start
```

5. Set **Build Filters** in Settings → Build & Deploy:
   - Included paths: `apps/web/**`, `packages/**`, `turbo.json`
   - This ensures deployment only when relevant files change

6. Add environment variables in the Environment tab

## 🔧 Monorepo-Specific Configuration

### Root Directory

Each service's `rootDir` is set to its app folder:

- API: `apps/api`
- Web: `apps/web`
- Docs: `apps/docs`
- Storybook: `apps/storybook`

All commands run relative to this directory, so:

- ✅ `npm run build` (correct - runs in the app directory)
- ❌ `cd apps/web && npm run build` (unnecessary)

### Build Filters

Build filters prevent unnecessary deployments. Each service only rebuilds when:

- Files in its app directory change
- Shared packages it depends on change
- Root configuration files change

Example for `blenvi-web`:

```yaml
buildFilter:
  paths:
    - apps/web/**
    - packages/ui/**
    - packages/typescript-config/**
    - package.json
    - turbo.json
```

**Important**: Changes to `render.yaml` always trigger a sync, regardless of build filters.

### Shared Dependencies

The monorepo uses npm workspaces. During build:

1. `npm install` at the root installs all workspace dependencies
2. Turbo handles the build orchestration
3. Each app builds with access to shared packages

## 📦 Service Details

### 1. blenvi-api (NestJS)

**Endpoint**: `https://blenvi-api.onrender.com` (or your custom domain)

**Build Process**:

```bash
npm install        # Install all workspace dependencies
npm run build      # Runs nest build
```

**Runtime**:

```bash
npm run start:prod # Runs node dist/main
```

**Port**: 3000

**Health Check**: `/` (default NestJS route)

### 2. blenvi-web (Next.js)

**Endpoint**: `https://blenvi-web.onrender.com`

**Build Process**:

```bash
npm install        # Install all workspace dependencies
npm run build      # Runs next build
```

**Runtime**:

```bash
npm run start      # Runs next start -p 3000
```

**Port**: 3000

**Health Check**: `/`

**Dependencies**:

- Supabase for authentication and database
- Shared UI components from `packages/ui`

### 3. blenvi-docs (Fumadocs)

**Endpoint**: `https://blenvi-docs.onrender.com`

**Build Process**:

```bash
npm install        # Install all workspace dependencies
npm run build      # Runs next build
```

**Runtime**:

```bash
npm run start      # Runs next start -p 3001
```

**Port**: 3001

**Health Check**: `/`

### 4. blenvi-storybook

**Endpoint**: `https://blenvi-storybook.onrender.com`

**Build Process**:

```bash
npm install           # Install all workspace dependencies
npm run build-storybook  # Builds static storybook
```

**Runtime**:

```bash
npx http-server storybook-static -p 3002
```

**Port**: 3002

**Note**: Storybook is built as a static site and served via http-server

## 🔍 Monitoring & Debugging

### View Logs

1. Go to your service in the Render Dashboard
2. Click on the **"Logs"** tab
3. View real-time logs for your service

### Common Issues

#### Issue: Build fails with "Cannot find module"

**Solution**: Ensure all shared packages are listed in workspace dependencies and build filters include package paths.

#### Issue: Service deploys on unrelated changes

**Solution**: Review and tighten your build filters to only include relevant paths.

#### Issue: Environment variables not working

**Solution**:

- For client-side vars in Next.js, use `NEXT_PUBLIC_` prefix
- Ensure variables are set in the Render Dashboard, not just in `render.yaml`
- Rebuild the service after adding new environment variables

### Health Checks

Render automatically health checks each service:

- **Default**: GET request to the specified path
- **Expected**: 2xx status code
- **Frequency**: Every 30 seconds

If health checks fail repeatedly, the service will be marked as unhealthy.

## 🔐 Security Best Practices

1. **Never commit secrets**: Use Render's environment variables
2. **Use separate environments**: Create separate services/blueprints for staging and production
3. **Restrict CORS**: Configure API CORS to only allow your web domain
4. **Enable HTTPS**: Render provides automatic SSL certificates
5. **Review service roles**: Use service-specific keys, not root/admin keys

## 💰 Cost Optimization

### Free Tier

Render offers free instances with limitations:

- Spin down after 15 minutes of inactivity
- 750 hours/month free (enough for 1 service running 24/7)
- Slower cold starts

### Recommendations

- Start with **free tier** for development/testing
- Use **starter** ($7/month) for production with better uptime
- Use **build filters** to avoid unnecessary builds (saves build minutes)
- Consider **static site** deployment for Storybook (cheaper)

## 🔄 CI/CD Workflow

With this setup:

1. **Push to GitHub** → Automatic deployment
2. **Only affected services** rebuild (thanks to build filters)
3. **Zero-downtime deploys** with health checks
4. **Rollback support** via Render Dashboard
5. **Preview environments** for pull requests (optional)

## 🌐 Custom Domains

To add custom domains:

1. Go to service → **Settings** → **Custom Domains**
2. Add your domain (e.g., `api.blenvi.com`)
3. Update DNS records as instructed
4. Render provides automatic SSL certificates

## 📚 Additional Resources

- [Render Monorepo Documentation](https://render.com/docs/monorepo-support)
- [Render Blueprint Spec](https://render.com/docs/blueprint-spec)
- [Render Web Services](https://render.com/docs/web-services)
- [Environment Variables](https://render.com/docs/configure-environment-variables)
- [Build Filters Guide](https://render.com/docs/monorepo-support#setting-build-filters)

## 🆘 Support

If you encounter issues:

1. Check [Render Status Page](https://status.render.com/)
2. Review [Render Community Forum](https://community.render.com/)
3. Contact [Render Support](https://render.com/support)

## 📝 Next Steps

After deployment:

1. ✅ Verify all services are running
2. ✅ Test API endpoints
3. ✅ Configure custom domains (optional)
4. ✅ Set up monitoring/alerting
5. ✅ Create staging environment
6. ✅ Document API endpoints
7. ✅ Set up preview environments for PRs

---

**Happy Deploying! 🚀**
