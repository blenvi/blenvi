# Vercel Commands Quick Reference

## 🚀 Deployment Commands

### Preview Deployment

```bash
# From root
npm run vercel:deploy

# Or directly
vercel
```

### Production Deployment

```bash
# From root
npm run vercel:deploy:prod

# Or directly
vercel --prod
```

### Deploy Specific App

```bash
# Web app
cd apps/web
vercel

# Docs app
cd apps/docs
vercel
```

## 🔧 Setup Commands

### Initial Setup

```bash
# Install Vercel CLI globally
npm install -g vercel@latest

# Login to Vercel
vercel login

# Link project (run in each app directory)
cd apps/web
vercel link

cd ../docs
vercel link
```

### Using Setup Script

```powershell
# PowerShell (Windows)
.\scripts\setup-vercel.ps1

# Bash (Mac/Linux)
chmod +x scripts/setup-vercel.sh
./scripts/setup-vercel.sh
```

## 📊 Monitoring & Logs

### View Deployment Logs

```bash
vercel logs [deployment-url]

# Or get latest
vercel logs
```

### List Deployments

```bash
# List all deployments
vercel list

# List for specific project
vercel list --scope=team-name
```

### Deployment Details

```bash
vercel inspect [deployment-url]
```

## 🔐 Environment Variables

### List Variables

```bash
vercel env ls

# Production only
vercel env ls production

# Preview only
vercel env ls preview
```

### Add Variable

```bash
vercel env add [name]

# Interactive prompt for value and environments
```

### Remove Variable

```bash
vercel env rm [name]
```

### Pull Environment Variables

```bash
# Pull to .env.local
vercel env pull
```

## 🌐 Domains

### List Domains

```bash
vercel domains ls
```

### Add Domain

```bash
vercel domains add [domain]
```

### Assign Domain to Project

```bash
vercel domains add [domain] [project-name]
```

## 👥 Team Management

### List Teams

```bash
vercel teams ls
```

### Switch Team

```bash
vercel switch [team-name]
```

### Invite Team Member

```bash
vercel teams invite [email]
```

## 🔗 Project Linking

### Link to Existing Project

```bash
vercel link
```

### Unlink Project

```bash
vercel unlink
```

## 🗑️ Cleanup

### Remove Deployment

```bash
vercel remove [deployment-url]
```

### Cancel Deployment

```bash
vercel cancel [deployment-url]
```

## 🔍 Inspection

### Check Project Info

```bash
vercel project ls
```

### Get Project Details

```bash
vercel inspect [deployment-url]
```

## 🎯 Useful Flags

### Common Flags

```bash
--prod                 # Deploy to production
--force                # Force deployment
--debug                # Show debug output
--scope [team-name]    # Specify team
--yes                  # Skip confirmation prompts
--token [token]        # Use specific token
```

## 📱 Examples

### Deploy to Preview

```bash
cd apps/web
vercel
```

### Deploy to Production

```bash
cd apps/web
vercel --prod
```

### Deploy with Debug

```bash
vercel --debug
```

### Force Deploy

```bash
vercel --force
```

### Deploy for Specific Team

```bash
vercel --scope=team-name
```

## 🔄 CI/CD Integration

### Environment Variables for CI

```bash
VERCEL_TOKEN         # Authentication token
VERCEL_ORG_ID        # Team/organization ID
VERCEL_PROJECT_ID    # Project ID
```

### GitHub Actions Example

```yaml
- name: Deploy to Vercel
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
    VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
    VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
  run: |
    npm install -g vercel@latest
    vercel deploy --token=$VERCEL_TOKEN
```

## 📦 Package.json Scripts

Already configured in your project:

```json
{
  "scripts": {
    "vercel:deploy": "vercel",
    "vercel:deploy:prod": "vercel --prod",
    "vercel:setup": "node scripts/setup-vercel.ps1"
  }
}
```

## 🆘 Troubleshooting Commands

### Clear Build Cache

```bash
vercel build --force
```

### Redeploy Latest

```bash
vercel --force
```

### Check CLI Version

```bash
vercel --version
```

### Update CLI

```bash
npm install -g vercel@latest
```

### Get Help

```bash
vercel help
vercel [command] --help
```

## 📚 Resources

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Vercel API Documentation](https://vercel.com/docs/rest-api)
- [Vercel SDK](https://vercel.com/docs/sdk)
