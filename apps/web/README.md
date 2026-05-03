## Web App

This app powers the Blenvi dashboard.

### Local development

```bash
bun run dev
```

Set `NEXT_PUBLIC_DOCS_URL` if you want the in-app sidebar to link to a
deployed documentation site.

### Cron poller security

The `/api/poll` route is protected using `CRON_SECRET`.

- In production, set `CRON_SECRET` in Vercel project environment variables.
- Vercel cron can call `/api/poll`; the route accepts:
  - `Authorization: Bearer <CRON_SECRET>`
  - `x-cron-secret: <CRON_SECRET>`

### Manual poll test

With local dev server running and `CRON_SECRET` set in `apps/web/.env.local`:

```bash
bun run test:poll
```

This sends a cron-authenticated request to `/api/poll` and prints the JSON response.
