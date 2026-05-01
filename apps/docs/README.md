# Docs App

Documentation app powered by Next.js + Fumadocs.

## Run Locally

```sh
bun install
bun run dev
```

Default port is `3001`.

## Useful Commands

```sh
bun run lint
bun run check-types
bun run build
```

## Structure

- `content/docs`: MDX content.
- `source.config.ts`: Fumadocs collection + schema config.
- `src/lib/source.ts`: Typed source loader helpers.
- `src/app/docs`: docs layout and page route.
- `src/app/api/search/route.ts`: search index endpoint.

## Environment

- `NEXT_PUBLIC_SITE_URL`: public docs origin used by metadata.
- `NEXT_PUBLIC_GITHUB_REPO`: `owner/repo` for docs GitHub links.
