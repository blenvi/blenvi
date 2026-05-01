# Blenvi Monorepo

Turborepo workspace for Blenvi web and docs applications.

## Workspace

- `apps/web`: customer-facing Next.js app.
- `apps/docs`: documentation site built with Fumadocs + Next.js.
- `packages/ui`: shared React UI primitives/components.
- `packages/biome-config`: shared Biome configuration.
- `packages/typescript-config`: shared TypeScript presets.

## Tooling

- Runtime/package manager: `bun`.
- Monorepo orchestration: `turbo`.
- Lint + format: `biome`.
- Type checking: `typescript`.
- Commit hooks: `husky` + `lint-staged` + `commitlint`.

## Getting Started

```sh
bun install
bun run dev
```

Run a specific app:

```sh
bunx turbo run dev --filter=web
bunx turbo run dev --filter=docs
```

## Quality Gates

```sh
bun run lint
bun run check-types
bun run build
```

## Project Configuration

- Set `NEXT_PUBLIC_SITE_URL` for canonical metadata in `apps/docs`.
- Set `NEXT_PUBLIC_GITHUB_REPO` (format: `owner/repo`) to enable "view on GitHub" links in docs.
