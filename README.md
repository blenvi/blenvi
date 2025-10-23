# Blenvi

A modern monorepo built with Turborepo, featuring multiple applications and shared packages.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `api`: a [NestJS](https://nestjs.com/) backend API
- `web`: a [Next.js](https://nextjs.org/) web application with Supabase integration
- `docs`: a [Fumadocs](https://fumadocs.vercel.app/) documentation site
- `storybook`: a [Storybook](https://storybook.js.org/) component library
- `native`: a [React Native](https://reactnative.dev/) mobile app (Expo)
- `@repo/ui`: a shared React component library using shadcn/ui
- `@repo/eslint-config`: shared `eslint` configurations
- `@repo/typescript-config`: shared `tsconfig.json` configurations

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build
yarn dlx turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build --filter=docs

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build --filter=docs
yarn exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev
yarn exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev --filter=web

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev --filter=web
yarn exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo login

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo login
yarn exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo link

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo link
yarn exec turbo link
pnpm exec turbo link
```

## 🚀 Deployment

This monorepo is deployed on **Netlify** for all applications.

### 📚 Deployment Guides

#### Netlify - Recommended ⭐

Deploy all apps (web, docs, storybook, and API) on Netlify:

- 📖 **[Netlify Deployment Guide](./NETLIFY_DEPLOYMENT.md)** - Complete setup instructions
- 🔍 **[Netlify Quick Reference](./NETLIFY_QUICK_REFERENCE.md)** - Commands and configurations

### 🎯 Deployment Setup

All applications deployed on Netlify:

```
Netlify (Free tier available):
├── Web App (apps/web)
├── Docs (apps/docs)
├── Storybook (apps/storybook)
└── API (apps/api)
```

**Total Cost**: Free tier available, scalable pricing

### Quick Deploy to Netlify

```powershell
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize each app
netlify init
```

See the [Netlify Deployment Guide](./NETLIFY_DEPLOYMENT.md) for detailed instructions on:

- Linking GitHub repositories to Netlify sites
- Configuring build settings
- Setting up environment variables
- Monitoring deployments

## 🌍 Environment Variables

Copy the `.env.example` files in each app directory and configure with your own values:

```bash
# For web app
cp apps/web/.env.example apps/web/.env.local

# For API
cp apps/api/.env.example apps/api/.env
```

See individual app directories for required environment variables.

## 📚 Documentation

### Deployment

- **Netlify**: [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) | [Quick Ref](./NETLIFY_QUICK_REFERENCE.md)
- **Post-Deploy**: [POST_DEPLOYMENT_CHECKLIST.md](./POST_DEPLOYMENT_CHECKLIST.md)
- **GitHub Linking**: [LINK_GITHUB_TO_NETLIFY.md](./LINK_GITHUB_TO_NETLIFY.md)

### App Documentation

- **API Documentation**: See [apps/api/README.md](./apps/api/README.md)
- **Web Documentation**: See [apps/web/README.md](./apps/web/README.md)

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, shadcn/ui
- **Backend**: NestJS
- **Database**: Supabase (PostgreSQL)
- **Mobile**: React Native (Expo)
- **Monorepo**: Turborepo
- **Deployment**: Netlify
- **CI/CD**: GitHub Actions

## Useful Links

Learn more about the tools used in this project:

- [Turborepo Documentation](https://turborepo.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
