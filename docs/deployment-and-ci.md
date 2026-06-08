# Deployment & CI

## Vercel

**Production URL:** https://cheshbon-analyzer.vercel.app

### `vercel.json`

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run vercel-build",
  "installCommand": "npm ci",
  "regions": ["fra1"]
}
```

### Build scripts

| Script | Command | Used by |
|--------|---------|---------|
| `build` | `prisma generate && next build` | CI, local |
| `vercel-build` | `prisma generate && prisma db push && next build` | Vercel |

**Difference:** Vercel auto-syncs DB schema on every deploy.

## Required environment variables (production)

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Prisma Postgres connection string |
| `AUTH_SECRET` | Yes | Auth.js — app breaks without it |
| `AUTH_URL` | Recommended | e.g. `https://cheshbon-analyzer.vercel.app` |
| `GOOGLE_CLIENT_ID` | Optional | Enables Google sign-in |
| `GOOGLE_CLIENT_SECRET` | Optional | Enables Google sign-in |
| `BLOB_READ_WRITE_TOKEN` | Optional | Vercel Blob for file storage |

Template: `.env.example` (never commit real values).

### Google OAuth redirect URIs

- `https://cheshbon-analyzer.vercel.app/api/auth/callback/google`
- `http://localhost:3000/api/auth/callback/google`

## GitHub Actions CI

File: `.github/workflows/ci.yml`

Triggers: push/PR to `main` or `master`

Steps:
1. `npm ci`
2. `npm run lint`
3. `npm run test` (Vitest)
4. `npm run build` (no `DATABASE_URL` — lazy Prisma allows this)
5. Install Playwright Chromium
6. `npm run test:e2e`

### E2E config

`playwright.config.ts`:
- Port **3100** (not 3000)
- `webServer`: `npm run start -- -p 3100` (requires prior build)
- Locale: `he-IL`
- CI: 2 retries, 1 worker

## Prisma Postgres lifecycle

1. Create: `npx create-db create -r eu-central-1 -e .env`
2. Claim within 24h at `CLAIM_URL` or DB is deleted
3. Manage at https://console.prisma.io

If claim link shows **Project Not Found** → DB expired → recreate and update `DATABASE_URL` on Vercel.

## Deploy manually

```bash
npx vercel login
npx vercel deploy --prod
```

Or push to `main` → GitHub → Vercel auto-deploy.

## Post-deploy checklist

- [ ] `AUTH_SECRET` set on Vercel
- [ ] `DATABASE_URL` set on Vercel
- [ ] Prisma DB claimed (permanent)
- [ ] Google OAuth redirect URI includes production URL
- [ ] CI green on GitHub Actions

## Monitoring auth in production

Quick check:
```bash
curl -s https://cheshbon-analyzer.vercel.app/api/auth/providers
```

Should return JSON with providers — not a configuration error message.
