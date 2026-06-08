# Development

## Prerequisites

- Node.js 20+
- npm

## Local setup

```bash
git clone https://github.com/nathmsi/cheshbon-analyzer.git
cd cheshbon-analyzer
npm install
cp .env.example .env
# Fill in DATABASE_URL, AUTH_SECRET, optional Google OAuth
npm run dev
```

Open http://localhost:3000

## Environment variables

See `.env.example` and [`deployment-and-ci.md`](./deployment-and-ci.md).

Generate auth secret:
```bash
openssl rand -base64 32
```

Create database:
```bash
npx create-db create -r eu-central-1 -e .env
# Claim at CLAIM_URL within 24h
npm run db:push
```

## npm scripts

| Script | Description |
|--------|-------------|
| `dev` | Next.js dev server |
| `build` | Production build (no db push) |
| `vercel-build` | Build + schema push (Vercel) |
| `start` | Production server |
| `lint` | ESLint |
| `test` | Vitest unit tests |
| `test:watch` | Vitest watch mode |
| `test:e2e` | Playwright (build first, port 3100) |
| `test:all` | test + build + e2e |
| `db:push` | Push Prisma schema |
| `db:generate` | Regenerate Prisma client |
| `generate-samples` | Create sample Excel files |

## Running tests

```bash
# Unit tests
npm run test

# E2E (ensure port 3100 is free)
npm run build
npm run test:e2e

# Full suite
npm run test:all
```

**Policy:** every new user-facing feature must include at least one basic E2E test — see `.cursor/rules/e2e-required.mdc`.

## Database GUI

```bash
cd cheshbon-analyzer   # not another project!
npx prisma studio      # http://localhost:5555
```

## Code style

- TypeScript strict mode
- Tailwind CSS 4 — design tokens in `globals.css` (`--brand`, etc.)
- Components: functional, `"use client"` where needed
- Path alias `@/` for imports
- Match existing file naming and patterns

## Adding translations

Edit `src/lib/i18n/translations.ts` — always add both `he` and `en` keys.

## Adding a protected page

1. Add route under `src/app/cases/` or new folder
2. Update `src/middleware.ts` matcher if new protected prefix
3. Use `requireAuthUserId()` in any new API routes

## Adding an API route

Follow patterns in `src/app/api/cases/`:
- Check `isDatabaseConfigured()`
- Authenticate with `requireAuthUserId()`
- Verify ownership for user-scoped resources
- Return appropriate HTTP status codes

## Postinstall

Automatically runs:
- `prisma generate`
- Copies PDF.js worker to `public/pdf.worker.mjs`

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Auth "Server error" on Vercel | Set `AUTH_SECRET` + redeploy |
| Prisma build fails locally | Run `npm run db:generate` |
| E2E port in use | Kill process on 3100 or change playwright config |
| Claim URL 404 | DB expired — recreate with `create-db` |
| `No database URL` in wrong project | Run commands from `cheshbon-analyzer` root |

## Related

- [`for-ai-agents.md`](./for-ai-agents.md) — AI-specific rules
- [`analyzers.md`](./analyzers.md) — adding analyzers
- [`authentication.md`](./authentication.md) — auth setup
