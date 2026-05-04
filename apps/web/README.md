# Blenvi Web

The web app powers the Blenvi dashboard. It is a Next.js 16 App Router
application using Supabase for auth/data, Zustand for client workspace/project
state, and `@blenvi/ui` for shared shadcn-style primitives.

## Product Scope

Blenvi supports the workspace to project hierarchy:

- users can belong to many workspaces
- workspaces can contain many projects
- projects can eventually contain many provider integrations
- only Neon Postgres is enabled in the UI for now

Neon data is split by polling mode:

- Soft check: lightweight health status check, used by automatic scheduled polling.
- Hard refresh: manual full snapshot for Neon details such as branches, operations,
  and consumption.

## Source Layout

```txt
src/
  actions/              server actions
  app/                  App Router pages, layouts, and route handlers
  components/
    features/           feature-specific dashboard UI
    forms/              reusable form components
    layouts/            app shell, navigation, page containers
    ui/                 app-local UI helpers
  constants/            API endpoints, route builders, UI text, polling values
  hooks/                custom React hooks
  lib/                  low-level clients and generic utilities
    supabase/           browser/server/service-role Supabase clients
    neon/               Neon API client and canonical snapshot polling
    validators/         Zod schemas
  services/             DB access, provider logic, polling workflows
  stores/               Zustand stores
  types/                shared DTOs and app/domain types
```

`packages/ui` remains the source of truth for shadcn primitives. Do not copy
those primitives into this app.

## Local Development

```bash
bun run dev
```

Copy `.env.example` to `.env.local` and configure Supabase, encryption, app URL,
and cron values.

Set `NEXT_PUBLIC_DOCS_URL` if the in-app sidebar should link to deployed docs.

## Required Environment

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ENCRYPTION_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `CRON_SECRET`
- `NEXT_PUBLIC_DOCS_URL` optional

In Supabase Auth URL settings, add:

- Site URL: same as `NEXT_PUBLIC_APP_URL`
- Redirect URL: `${NEXT_PUBLIC_APP_URL}/api/auth/callback`

## Cron Poller Security

The `/api/poll` route is protected using `CRON_SECRET`.

Accepted headers:

- `Authorization: Bearer <CRON_SECRET>`
- `x-cron-secret: <CRON_SECRET>`

With the local dev server running and `CRON_SECRET` set:

```bash
bun run test:poll
```

## Quality Gates

```bash
bun run lint
bun run check-types
bun run build
```

These commands are the baseline checks for refactors and SonarQube cleanup.
