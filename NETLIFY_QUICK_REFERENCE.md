# Netlify Deployment Quick Reference

## 🎯 Quick Start Commands

### Install & Login

```powershell
npm install -g netlify-cli
netlify login
```

### Initialize Site

```powershell
netlify init
```

### Link Existing Site

```powershell
netlify link
```

### Test Build Locally

```powershell
netlify build --filter=web
```

### Deploy Manually

```powershell
netlify deploy --filter=web --prod
```

## 📋 Site Configuration Summary

| Site      | Package Dir      | Build Command                                | Publish Dir                       | Port |
| --------- | ---------------- | -------------------------------------------- | --------------------------------- | ---- |
| Web       | `apps/web`       | `npm run build --filter=web`                 | `apps/web/.next`                  | 3000 |
| Docs      | `apps/docs`      | `npm run build --filter=docs`                | `apps/docs/.next`                 | 3001 |
| Storybook | `apps/storybook` | `npm run build-storybook --filter=storybook` | `apps/storybook/storybook-static` | 3002 |

## 🔧 Environment Variables

### blenvi-web

```bash
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Set via CLI

```powershell
netlify env:set KEY "value"
netlify env:list
netlify env:get KEY
netlify env:unset KEY
```

### Set via Dashboard

1. Site settings → Environment variables
2. Add variable
3. Select scopes (Production, Deploy Previews, etc.)
4. Save

## 🔄 Build Ignore Patterns

Each app has an ignore command in `netlify.toml`:

**Web App** - Only builds if these paths change:

```bash
apps/web/**
packages/ui/**
packages/typescript-config/**
packages/eslint-config/**
package.json
turbo.json
```

**Docs** - Only builds if these paths change:

```bash
apps/docs/**
packages/typescript-config/**
packages/eslint-config/**
package.json
turbo.json
```

**Storybook** - Only builds if these paths change:

```bash
apps/storybook/**
packages/ui/**
packages/typescript-config/**
packages/eslint-config/**
package.json
turbo.json
```

## 🚀 Deployment Contexts

### Production (main branch)

```toml
[context.production]
  command = "npm run build --filter=web"
```

### Deploy Previews (PRs)

```toml
[context.deploy-preview]
  command = "npm run build --filter=web"
```

### Branch Deploys

```toml
[context.staging]
  command = "npm run build --filter=web"
```

## 📊 Netlify CLI Commands

### Site Management

```powershell
netlify sites:list          # List all sites
netlify sites:create        # Create new site
netlify sites:delete SITE_ID # Delete site
netlify open                # Open site in browser
netlify open:admin          # Open admin dashboard
```

### Build & Deploy

```powershell
netlify build               # Build locally
netlify deploy              # Deploy draft
netlify deploy --prod       # Deploy to production
netlify deploy --alias=test # Deploy with alias
```

### Development

```powershell
netlify dev                 # Start local dev server
netlify dev --filter=web    # Start specific app
netlify functions:serve     # Serve functions locally
```

### Environment Variables

```powershell
netlify env:list            # List all env vars
netlify env:set KEY "value" # Set env var
netlify env:get KEY         # Get env var value
netlify env:unset KEY       # Delete env var
netlify env:import FILE     # Import from file
```

### Logs & Status

```powershell
netlify status              # Show site status
netlify watch               # Watch for deploy updates
```

### Functions

```powershell
netlify functions:list      # List all functions
netlify functions:create NAME # Create new function
netlify functions:invoke NAME # Test function locally
```

## 🌐 Custom Domains

### Add via CLI

```powershell
netlify domains:add yourdomain.com
```

### Add via Dashboard

1. Site settings → Domain management
2. Add custom domain
3. Follow DNS instructions
4. SSL auto-configured

### Recommended Structure

```
app.yourdomain.com     → Web App
docs.yourdomain.com    → Documentation
storybook.yourdomain.com → Storybook
```

## 🔐 Security Headers (in netlify.toml)

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'"
```

## 🔀 Redirects & Rewrites

### In netlify.toml

```toml
# Simple redirect
[[redirects]]
  from = "/old-path"
  to = "/new-path"
  status = 301

# SPA fallback
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Proxy to API
[[redirects]]
  from = "/api/*"
  to = "https://api.example.com/:splat"
  status = 200
```

## 📦 Netlify Plugins

### Common Plugins

```toml
[[plugins]]
  package = "@netlify/plugin-nextjs"

[[plugins]]
  package = "netlify-plugin-cache"

[[plugins]]
  package = "@netlify/plugin-sitemap"
```

### Install Plugin

```powershell
npm install -D @netlify/plugin-nextjs
```

## 🐛 Troubleshooting

### Check Build Logs

```powershell
netlify logs            # View recent logs
netlify logs --prod     # Production logs
```

### Test Build Locally

```powershell
netlify build --debug
```

### Clear Cache

```powershell
netlify build --clear-cache
```

### Common Issues

**Build fails:**

- Check Node version in `netlify.toml`
- Verify build command
- Check environment variables
- Review build logs

**Site won't load:**

- Verify publish directory
- Check redirect rules
- Review browser console

**Changes don't trigger build:**

- Check ignore command in `netlify.toml`
- Verify git diff includes changed files
- Check build filters

## 📈 Performance

### Edge Functions

For dynamic server-side logic:

```javascript
// netlify/edge-functions/hello.ts
export default async (request: Request) => {
  return new Response("Hello from the edge!");
};
```

### Image CDN

Automatic image optimization:

```html
<img src="/.netlify/images?url=/photo.jpg&w=800" />
```

### Asset Optimization

Netlify automatically:

- Minifies CSS/JS
- Compresses images
- Serves over CDN
- Adds cache headers

## 💰 Plans & Pricing

| Plan     | Price     | Build Minutes  | Bandwidth    |
| -------- | --------- | -------------- | ------------ |
| Starter  | Free      | 300 min/month  | 100 GB/month |
| Pro      | $19/month | 1000 min/month | 1 TB/month   |
| Business | $99/month | Unlimited      | 2 TB/month   |

### Monitor Usage

```powershell
netlify status          # Shows usage stats
```

Or check in dashboard: Team settings → Usage

## 🔗 Useful Links

- **Dashboard**: https://app.netlify.com/
- **Documentation**: https://docs.netlify.com/
- **Status Page**: https://www.netlifystatus.com/
- **Community**: https://answers.netlify.com/
- **CLI Docs**: https://cli.netlify.com/

## 📱 Deploy Previews

### Enable for PRs

1. Site settings → Build & deploy → Deploy contexts
2. Enable "Deploy Previews"
3. Each PR gets unique URL

### Preview URL Format

```
https://deploy-preview-123--your-site.netlify.app
```

### Branch Deploys

Deploy specific branches:

1. Site settings → Build & deploy → Deploy contexts
2. Enable "Branch deploys"
3. Select branches to deploy

## 🎨 Badge & Status

### Deploy Status Badge

Add to README.md:

```markdown
[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR_SITE_ID/deploy-status)](https://app.netlify.com/sites/YOUR_SITE/deploys)
```

## 🔧 Advanced Configuration

### Split Testing

```toml
[[redirects]]
  from = "/*"
  to = "/version-a/:splat"
  status = 200
  conditions = {Cookie = ["bucket=a"]}

[[redirects]]
  from = "/*"
  to = "/version-b/:splat"
  status = 200
```

### Form Handling

```html
<form netlify>
  <input type="text" name="email" />
  <button type="submit">Submit</button>
</form>
```

### Analytics

```toml
[context.production]
  [context.production.environment]
    NETLIFY_ANALYTICS = "true"
```

## 💡 Pro Tips

1. **Use `--filter` flag** with Turbo for faster builds
2. **Set up ignore commands** to skip unnecessary builds
3. **Enable deploy previews** for all PRs
4. **Use context-specific env vars** for different environments
5. **Test builds locally** with `netlify build` before pushing
6. **Monitor build minutes** to stay within plan
7. **Use Netlify CLI** for faster workflow
8. **Set up notifications** for deploy failures
9. **Use package directory** for proper monorepo support
10. **Cache node_modules** for faster installs

## 🆘 Need Help?

Quick fixes:

```powershell
# Reset everything
netlify unlink
netlify login
netlify init

# Check site info
netlify status

# View deploy
netlify open

# Get support
netlify help
```

For detailed help, see [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)

---

**Happy Deploying on Netlify! 🚀**
