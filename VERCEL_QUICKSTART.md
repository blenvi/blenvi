# 🚀 Quick Start: Vercel Deployment

## Option 1: Using Vercel Dashboard (Recommended)

### Step 1: Import Web App

1. Visit [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository (`blenvi`)
3. Configure:
   - **Project Name**: `blenvi-web`
   - **Framework**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && turbo run build --filter=web...`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Step 2: Import Docs App

1. Visit [vercel.com/new](https://vercel.com/new) again
2. Import the same repository
3. Configure:
   - **Project Name**: `blenvi-docs`
   - **Framework**: Next.js
   - **Root Directory**: `apps/docs`
   - **Build Command**: `cd ../.. && turbo run build --filter=docs...`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Step 3: Add Environment Variables (Web App)

In Vercel Dashboard → blenvi-web → Settings → Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 4: Deploy

- Push to `main` branch → Production deployment
- Create PR → Preview deployment

## Option 2: Using Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel@latest
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Run Setup Script

```bash
# On Windows PowerShell
.\scripts\setup-vercel.ps1

# On Mac/Linux
chmod +x scripts/setup-vercel.sh
./scripts/setup-vercel.sh
```

### Step 4: Deploy

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

## 🎯 What's Different from Netlify?

| Aspect    | Netlify                  | Vercel         |
| --------- | ------------------------ | -------------- |
| Config    | `netlify.toml`           | `vercel.json`  |
| Plugin    | `@netlify/plugin-nextjs` | Native support |
| Dashboard | netlify.app              | vercel.com     |
| CLI       | `netlify`                | `vercel`       |

## 📋 Checklist

- [ ] Vercel account created
- [ ] Web app imported to Vercel
- [ ] Docs app imported to Vercel
- [ ] Environment variables configured
- [ ] Test preview deployment (create a PR)
- [ ] Test production deployment (merge to main)
- [ ] Custom domain configured (optional)
- [ ] Remove Netlify configs (optional)

## 🆘 Common Issues

### Build Fails

- Check Node.js version is 20+
- Verify all dependencies in package.json
- Check environment variables

### Monorepo Not Working

- Ensure Root Directory is set correctly (e.g., `apps/web`)
- Build command must start with `cd ../..`

### Environment Variables Not Working

- Must set for all environments: Production, Preview, Development
- Restart deployment after adding variables

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Monorepo Guide](https://vercel.com/docs/monorepos)
- [Migration Guide](./VERCEL_MIGRATION.md)
