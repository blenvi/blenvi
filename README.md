# Blenvi

Blenvi is an open-source SaaS integration health dashboard for solo developers
and small teams. It helps teams connect provider integrations, monitor health
checks, inspect usage, and keep workspace/project context in one place.

The product model is:

- many workspaces per user
- many projects per workspace
- many provider integrations per project over time
- Neon Postgres is the only enabled provider right now

## Monorepo

This repository uses Turborepo with Bun workspaces.

- `apps/web`: Next.js 16 dashboard application.
- `apps/docs`: documentation site built with Fumadocs and Next.js.
- `packages/ui`: shared shadcn-style React primitives and UI components.
- `packages/biome-config`: shared Biome configuration.
- `packages/typescript-config`: shared TypeScript presets.

## Web Architecture

The web app keeps shadcn primitives in `packages/ui` and organizes app-specific
code under `apps/web/src`:

- `app`: Next.js App Router pages, layouts, route handlers, and route-private helpers.
- `actions`: server actions used by forms and client flows.
- `components/features`: feature-specific compound UI.
- `components/forms`: reusable form components.
- `components/layouts`: shells, navigation, sidebars, and page wrappers.
- `components/ui`: app-local UI helpers that are not shadcn primitives.
- `constants`: typed route builders, API endpoints, UI text, and polling values.
- `lib`: low-level clients and utilities, including Supabase and Neon clients.
- `services`: database access, provider business logic, and polling workflows.
- `stores`: Zustand stores.
- `types`: shared DTOs, store contracts, component types, and database/domain types.

## Getting Started

Install dependencies:

```sh
bun install
```

Run all dev tasks through Turbo:

```sh
bun run dev
```

Run a specific app:

```sh
bunx turbo run dev --filter=web
bunx turbo run dev --filter=docs
```

## Environment

Copy `apps/web/.env.example` to `apps/web/.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ENCRYPTION_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `CRON_SECRET`
- `NEXT_PUBLIC_DOCS_URL` if the dashboard sidebar should link to deployed docs

Docs-specific configuration:

- `NEXT_PUBLIC_SITE_URL` for canonical docs metadata.
- `NEXT_PUBLIC_GITHUB_REPO` in `owner/repo` format for docs GitHub links.

## Quality Gates

Run these before opening a PR or pushing a cleanup-heavy branch:

```sh
bun run lint
bun run check-types
bun run build
```

For web-only validation:

```sh
cd apps/web
bun run lint
bun run check-types
bun run build
```

## Polling

Blenvi has two Neon polling modes:

- Soft polling: lightweight health checks, used by scheduled automatic polling.
- Hard polling: manual full Neon snapshot refresh for branches, operations, and usage.

The `/api/poll` route is cron-protected with `CRON_SECRET`. Manual integration
polling is handled by `/api/integrations/[integration-id]/poll`.

## Contributing

Keep refactors monorepo-aware:

- do not duplicate shadcn primitives into `apps/web`
- keep reusable app constants in `apps/web/src/constants`
- keep shared public types in `apps/web/src/types`
- keep Supabase clients in `apps/web/src/lib/supabase`
- prefer service functions over direct database queries in components
- run the quality gates before commit
