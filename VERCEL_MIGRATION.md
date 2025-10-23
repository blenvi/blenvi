# Migration Guide: Netlify to Vercel

This guide walks you through migrating the Blenvi monorepo from Netlify to Vercel.

## 📋 Prerequisites

- Vercel account (free tier is fine)
- GitHub repository connected
- Node.js 20+ installed locally

## 🚀 Migration Steps

### 1. Import Projects to Vercel

You need to create separate Vercel projects for each app in the monorepo:

#### Import Web App

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import your GitHub repository
3. Configure the project:
   - **Project Name**: `blenvi-web` (or your preferred name)
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && turbo run build --filter=web...`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. Add Environment Variables (if needed):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

#### Import Docs App

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import the same GitHub repository again
3. Configure the project:
   - **Project Name**: `blenvi-docs` (or your preferred name)
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/docs`
   - **Build Command**: `cd ../.. && turbo run build --filter=docs...`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 2. Configure Ignored Build Step (Optional)

To avoid unnecessary builds when files haven't changed, you can configure Vercel's Ignored Build Step:

1. In each Vercel project settings, go to **Git** → **Ignored Build Step**
2. Set a custom command:

For **Web App**:

```bash
git diff --quiet HEAD^ HEAD apps/web packages/ui packages/typescript-config packages/eslint-config package.json turbo.json
```

For **Docs App**:

```bash
git diff --quiet HEAD^ HEAD apps/docs packages/typescript-config packages/eslint-config package.json turbo.json
```

### 3. Update GitHub Repository

The migration has already created these files:

- `vercel.json` - Root configuration
- `apps/web/vercel.json` - Web app configuration
- `apps/docs/vercel.json` - Docs app configuration
- `.github/workflows/vercel-preview.yml` - Preview deployment workflow
- `.github/workflows/vercel-production.yml` - Production deployment workflow

### 4. Remove Netlify Configuration (Optional)

You can safely remove or archive these files:

- `netlify.toml` (root)
- `apps/web/netlify.toml`
- `apps/docs/netlify.toml`
- `apps/api/netlify.toml`
- `.github/workflows/netlify-validate.yml`

Command to remove:

```bash
git rm netlify.toml apps/*/netlify.toml .github/workflows/netlify-validate.yml
```

### 5. Deploy API (NestJS) - Serverless Functions

For the NestJS API, you have several options:

#### Option A: Vercel Serverless Functions (Recommended for simple APIs)

Convert your NestJS app to serverless functions. Create `api/index.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { VercelRequest, VercelResponse } from '@vercel/node';

let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    await app.init();
  }
  return app;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  const app = await bootstrap();
  return app.getHttpAdapter().getInstance()(req, res);
};
```

#### Option B: External Hosting

Host the NestJS API separately on:

- Railway.app (recommended)
- Render.com
- Fly.io
- AWS/GCP/Azure

### 6. Update Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all environment variables from Netlify
3. Set them for: Production, Preview, and Development as needed

### 7. Test Deployments

1. Create a new branch and push changes
2. Vercel will automatically create a preview deployment
3. Test all functionality
4. Merge to `main` for production deployment

## 🔍 Key Differences

| Feature          | Netlify          | Vercel                |
| ---------------- | ---------------- | --------------------- |
| Next.js Support  | Plugin required  | Native                |
| Monorepo         | Manual config    | Built-in support      |
| Edge Functions   | Netlify Edge     | Vercel Edge Functions |
| Build Minutes    | 300/month (free) | 6,000/month (free)    |
| Bandwidth        | 100GB/month      | 100GB/month           |
| Deployment Speed | Fast             | Very Fast             |

## 🎯 Vercel Features to Explore

- **Edge Functions**: For ultra-fast serverless functions
- **Edge Middleware**: For request manipulation
- **Analytics**: Built-in web analytics
- **Speed Insights**: Performance monitoring
- **Image Optimization**: Automatic image optimization
- **Incremental Static Regeneration (ISR)**: For Next.js

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Monorepo Guide](https://vercel.com/docs/monorepos)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)

## 🆘 Troubleshooting

### Build Fails

1. Check build logs in Vercel Dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version (should be 20+)
4. Check environment variables are set

### Preview Deployments Not Working

1. Ensure GitHub integration is connected
2. Check branch protection rules
3. Verify Vercel app has repository access

### Monorepo Build Issues

1. Ensure Turbo is configured correctly
2. Check root directory is set to the app folder
3. Verify build command includes `cd ../..` to run from root

## ✅ Migration Checklist

- [ ] Import Web app to Vercel
- [ ] Import Docs app to Vercel
- [ ] Configure build settings
- [ ] Add environment variables
- [ ] Test preview deployments
- [ ] Test production deployment
- [ ] Update DNS (if using custom domain)
- [ ] Monitor first few deployments
- [ ] Remove Netlify configuration files
- [ ] Update team documentation
- [ ] Decide on API hosting solution

## 🎉 Done!

Your migration from Netlify to Vercel is complete. Enjoy faster deployments and better Next.js integration!
