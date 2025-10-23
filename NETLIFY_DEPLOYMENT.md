# Deploying Blenvi Monorepo to Netlify

This guide explains how to deploy the Blenvi monorepo to Netlify with multiple sites.

## 📋 Prerequisites

- A [Netlify account](https://app.netlify.com/signup)
- Your GitHub/GitLab/Bitbucket repository connected to Netlify
- Node.js 18+ (specified in `package.json`)
- Netlify CLI installed globally: `npm install -g netlify-cli`

## 🏗️ Architecture Overview

The monorepo contains 4 deployable applications:

1. **blenvi-web** - Next.js web application (apps/web)
2. **blenvi-docs** - Fumadocs documentation site (apps/docs)
3. **blenvi-storybook** - Storybook component library (apps/storybook)
4. **blenvi-api** - NestJS backend (requires Netlify Functions or external hosting)

> **Note**: Netlify is optimized for static sites and serverless functions. For the NestJS API, consider:
>
> - Converting endpoints to [Netlify Functions](https://docs.netlify.com/functions/overview/)
> - Deploying the API separately on [Render](https://render.com/), [Railway](https://railway.app/), or [Fly.io](https://fly.io/)

Each site is configured with:

- **Package Directory**: Points to the specific app folder
- **Ignore Command**: Only triggers builds when relevant files change
- **Independent Deployments**: Each site deploys independently

## 🚀 Deployment Methods

### Option 1: Using Netlify CLI (Recommended for Initial Setup)

#### Step 1: Install and Login

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login
```

This will open a browser window for authentication.

#### Step 2: Initialize Each Site

Navigate to your project root and initialize each site:

```bash
cd c:/Users/KIIT/projects/blenvi

# Initialize web app
netlify init

# When prompted:
# - Select "Create & configure a new site"
# - Choose your team
# - Site name: blenvi-web
# - Build command: npm run build --filter=web
# - Directory to deploy: apps/web/.next
```

Repeat for each app (docs, storybook).

#### Step 3: Link Sites to Monorepo

The CLI will create `.netlify` folders in your project. Each site will be linked to the monorepo.

### Option 2: Using Netlify Dashboard

This is the easiest method for monorepos with automatic detection.

#### Step 1: Create Sites from Dashboard

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your Git provider (GitHub/GitLab/Bitbucket)
4. Select the `blenvi` repository

#### Step 2: Configure First Site (Web App)

Netlify should automatically detect your monorepo and show available sites.

**If auto-detected:**

- Select `apps/web` from the "Site to deploy" dropdown
- Netlify will auto-fill build settings

**If manual configuration needed:**

```
Site name: blenvi-web
Base directory: (leave empty - uses repository root)
Package directory: apps/web
Build command: npm run build --filter=web
Publish directory: apps/web/.next
```

#### Step 3: Set Environment Variables

In the site settings:

1. Go to **Site settings** → **Environment variables**
2. Add the following variables:

```bash
NODE_VERSION=18
NPM_VERSION=11.6.2
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Step 4: Repeat for Other Sites

Create separate sites for:

- **blenvi-docs** (package directory: `apps/docs`)
- **blenvi-storybook** (package directory: `apps/storybook`)

## 🔧 Monorepo-Specific Configuration

### Package Directory vs Base Directory

**Base Directory** (leave empty):

- Where Netlify installs dependencies and runs builds
- Default: repository root (`/`)
- Benefits: All workspace dependencies are installed once

**Package Directory** (set for each site):

- Where your site's source files and `netlify.toml` are located
- Example: `apps/web`, `apps/docs`, `apps/storybook`
- Netlify uses this to find configuration files

### Build Commands with Turbo

Each site uses Turbo's `--filter` flag to build only what's needed:

```bash
# Web app - builds web and its dependencies
npm run build --filter=web

# Docs - builds docs and its dependencies
npm run build --filter=docs

# Storybook - builds storybook
npm run build-storybook --filter=storybook
```

### Ignore Builds Configuration

Each `netlify.toml` includes an ignore command that checks if relevant files changed:

```toml
[build.ignore]
  command = '''
    if [ "$CACHED_COMMIT_REF" = "" ]; then
      echo "First build - building"
      exit 1
    fi

    # Only build if specific paths changed
    git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF apps/web packages/ui
  '''
```

This prevents unnecessary builds and saves build minutes.

## 📦 Site Details

### 1. blenvi-web (Next.js)

**URL**: `https://blenvi-web.netlify.app` (or custom domain)

**Configuration**:

```toml
# apps/web/netlify.toml
[build]
  command = "npm run build --filter=web"
  publish = "apps/web/.next"
```

**Package Directory**: `apps/web`

**Build Process**:

1. Netlify runs `npm install` at repository root
2. Turbo builds web app and dependencies
3. Publishes `.next` output directory

**Environment Variables Required**:

- `NODE_VERSION`
- `NPM_VERSION`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2. blenvi-docs (Fumadocs)

**URL**: `https://blenvi-docs.netlify.app`

**Configuration**:

```toml
# apps/docs/netlify.toml
[build]
  command = "npm run build --filter=docs"
  publish = "apps/docs/.next"
```

**Package Directory**: `apps/docs`

**Build Process**:

1. Netlify runs `npm install` at repository root
2. Turbo builds docs app
3. Publishes `.next` output directory

**Environment Variables Required**:

- `NODE_VERSION`
- `NPM_VERSION`

### 3. blenvi-storybook

**URL**: `https://blenvi-storybook.netlify.app`

**Configuration**:

```toml
# apps/storybook/netlify.toml
[build]
  command = "npm run build-storybook --filter=storybook"
  publish = "apps/storybook/storybook-static"
```

**Package Directory**: `apps/storybook`

**Build Process**:

1. Netlify runs `npm install` at repository root
2. Builds static Storybook site
3. Publishes `storybook-static` directory

**Environment Variables Required**:

- `NODE_VERSION`
- `NPM_VERSION`

### 4. blenvi-api (NestJS) - Special Considerations

The NestJS API requires a long-running server, which Netlify doesn't support directly. Here are your options:

#### Option A: Convert to Netlify Functions

Convert your API endpoints to serverless functions:

```typescript
// netlify/functions/api.ts
import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  // Your API logic here
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from Netlify Functions' }),
  };
};
```

#### Option B: Deploy API Separately

Deploy the API to a platform that supports long-running processes:

- [Render](https://render.com/) - Recommended for NestJS
- [Railway](https://railway.app/)
- [Fly.io](https://fly.io/)
- [Heroku](https://www.heroku.com/)

Then update your web app's `NEXT_PUBLIC_API_URL` to point to the API.

## 🔍 Netlify CLI Commands

### Link an Existing Site

```bash
cd apps/web
netlify link
```

### Deploy Manually

```bash
# Deploy to production
netlify deploy --prod

# Deploy preview
netlify deploy
```

### Open Site in Browser

```bash
netlify open
```

### View Build Logs

```bash
netlify watch
```

### Work with Environment Variables

```bash
# List env vars
netlify env:list

# Set env var
netlify env:set KEY value

# Import from .env file
netlify env:import .env
```

### Test Functions Locally

```bash
netlify functions:serve
```

## 🔐 Environment Variables

### Setting Environment Variables

#### Via Netlify UI:

1. Go to **Site settings** → **Environment variables**
2. Click **"Add a variable"**
3. Enter key and value
4. Select which contexts to apply (Production, Deploy Preview, Branch deploys)

#### Via Netlify CLI:

```bash
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://your-project.supabase.co"
```

#### Via netlify.toml (not recommended for secrets):

```toml
[context.production.environment]
  NODE_VERSION = "18"
```

### Required Environment Variables

#### For Web App (`blenvi-web`):

```bash
NODE_VERSION=18
NPM_VERSION=11.6.2
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

#### For All Apps:

```bash
NODE_VERSION=18
NPM_VERSION=11.6.2
```

## 🔄 CI/CD Workflow

### Automatic Deploys

By default, Netlify automatically deploys when you push to your repository:

1. **Push to main** → Production deploy
2. **Push to branch** → Branch deploy (if enabled)
3. **Open PR** → Deploy preview

### Customizing Auto-Deploy Branches

In site settings:

1. Go to **Site settings** → **Build & deploy** → **Continuous deployment**
2. Set **Production branch** (e.g., `main`)
3. Enable/disable **Branch deploys**
4. Enable/disable **Deploy previews**

### Deploy Contexts

Netlify supports different contexts with different configurations:

```toml
# Production
[context.production]
  command = "npm run build --filter=web"

[context.production.environment]
  NODE_ENV = "production"

# Deploy previews (PRs)
[context.deploy-preview]
  command = "npm run build --filter=web"

# Branch deploys
[context.branch-deploy]
  command = "npm run build --filter=web"

# Specific branch
[context.staging]
  command = "npm run build --filter=web"
```

## 🌐 Custom Domains

### Adding a Custom Domain

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `app.blenvi.com`)
4. Follow DNS configuration instructions
5. Netlify automatically provisions SSL certificate

### Recommended Domain Setup

```
app.blenvi.com       → blenvi-web (main app)
docs.blenvi.com      → blenvi-docs (documentation)
storybook.blenvi.com → blenvi-storybook (component library)
api.blenvi.com       → blenvi-api (if hosted elsewhere)
```

## 🔒 Security Best Practices

### 1. Environment Variables

- ✅ Store all secrets in Netlify environment variables
- ❌ Never commit secrets to repository
- ✅ Use `NEXT_PUBLIC_` prefix only for client-safe variables

### 2. Headers

Security headers are configured in each `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
```

### 3. Access Control

- Enable password protection for staging/preview deploys
- Set up role-based access in team settings
- Use Netlify Identity for authentication

## 📊 Monitoring & Analytics

### Built-in Analytics

Enable Netlify Analytics:

1. Go to **Analytics** tab
2. Enable analytics (paid feature)
3. View traffic, bandwidth, and performance metrics

### Deploy Notifications

Set up notifications:

1. Go to **Site settings** → **Build & deploy** → **Deploy notifications**
2. Add notifications for:
   - Deploy started
   - Deploy succeeded
   - Deploy failed
3. Integrate with Slack, email, or webhooks

### Build Logs

View build logs:

1. Go to **Deploys** tab
2. Click on any deploy
3. View detailed build logs and debug information

## 🐛 Troubleshooting

### Build Fails with "Module not found"

**Problem**: Dependencies not installed correctly.

**Solution**:

```bash
# Ensure all dependencies are in workspace root
npm install

# Clear Netlify cache
netlify build --clear-cache
```

### Build Doesn't Trigger on File Changes

**Problem**: Ignore build command is too restrictive.

**Solution**: Review your ignore command in `netlify.toml`:

```toml
[build.ignore]
  command = "git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF apps/web"
```

### Environment Variables Not Working

**Problem**: Variables not properly set or wrong context.

**Solution**:

1. Check variable is set in Netlify UI
2. Verify it's enabled for correct context (Production/Preview)
3. Rebuild the site after adding variables
4. For Next.js, ensure `NEXT_PUBLIC_` prefix for client-side vars

### Next.js Build Timeout

**Problem**: Build takes longer than allowed time.

**Solution**:

1. Optimize build by reducing dependencies
2. Use `output: 'standalone'` in `next.config.ts`
3. Consider upgrading Netlify plan for longer build times

### Incorrect Publish Directory

**Problem**: Site shows 404 or wrong files.

**Solution**: Check publish directory matches your framework's output:

- Next.js: `apps/web/.next`
- Storybook: `apps/storybook/storybook-static`

## 💰 Cost Considerations

### Free Tier Includes:

- 300 build minutes/month
- 100 GB bandwidth/month
- Unlimited sites
- 1 concurrent build
- Deploy previews
- HTTPS/SSL certificates

### Paid Plans:

- **Starter** ($19/mo): 500 build minutes, 400 GB bandwidth
- **Pro** ($19/mo per member): 1,000 build minutes, 1 TB bandwidth, team features
- **Enterprise**: Custom pricing with SLA

### Optimization Tips:

1. Use ignore commands to prevent unnecessary builds
2. Enable build caching
3. Optimize dependencies to reduce build time
4. Use CDN for static assets

## 📚 Additional Resources

- [Netlify Monorepo Documentation](https://docs.netlify.com/build/configure-builds/monorepos/)
- [Netlify CLI Documentation](https://docs.netlify.com/cli/get-started/)
- [File-based Configuration](https://docs.netlify.com/build/configure-builds/file-based-configuration/)
- [Next.js on Netlify](https://docs.netlify.com/frameworks/next-js/overview/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)

## 🔗 Quick Links

- **Dashboard**: https://app.netlify.com/
- **Status Page**: https://www.netlifystatus.com/
- **Community**: https://answers.netlify.com/
- **Support**: https://www.netlify.com/support/

## 📝 Next Steps

After deployment:

1. ✅ Verify all sites are deployed successfully
2. ✅ Configure custom domains
3. ✅ Set up environment variables
4. ✅ Test ignore build commands
5. ✅ Enable analytics (optional)
6. ✅ Set up deploy notifications
7. ✅ Configure access control for previews
8. ✅ Test deploy previews on PRs

---

**Happy Deploying with Netlify! 🚀**
