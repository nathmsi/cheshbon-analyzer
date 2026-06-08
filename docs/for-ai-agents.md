# Guide for AI Agents

Read this file first when working on **cheshbon-analyzer**.

---

## Mandatory rules

1. **Cursor rules** in `.cursor/rules/` — especially `e2e-required.mdc` (basic E2E test for every new feature).

2. **Next.js 16 is different.** Do not rely on training data for Next.js APIs. Check `node_modules/next/dist/docs/` and `AGENTS.md` before writing framework code.

3. **Minimize scope.** Match existing patterns. Do not refactor unrelated code.

4. **Two analysis flows exist** — do not conflate them:
   - `/analyze/[type]` → **client-side only**, files never leave the browser
   - `/cases/[id]` → **server-side**, files stored in DB (+ optional Vercel Blob)

5. **Prisma client is lazy.** `src/lib/db/prisma.ts` uses a Proxy — `DATABASE_URL` may be absent at build time (CI). Use `isDatabaseConfigured()` in API routes.

6. **Auth is split:**
   - `src/auth.config.ts` → edge/middleware (Google only)
   - `src/auth.ts` → full server config (+ Credentials + PrismaAdapter)

7. **Dynamic route params are async** in Next.js 16 — `params` is a `Promise`; use `await params` on server, `use(params)` on client.

8. **Generated code is gitignored.** Run `prisma generate` after schema changes. Output: `src/generated/prisma/`.

9. **E2E tests use `data-testid`.** New features need a basic Playwright test — see `.cursor/rules/e2e-required.mdc`.

10. **Do not commit secrets.** Never commit `.env`. Document new vars in `.env.example` only.

11. **Only commit when the user asks.**

---

## Common tasks

| Task | Where to look |
|------|---------------|
| Add analyzer | `src/lib/analyzers/`, `registry.ts`, `translations.ts` |
| Protect a route | `src/middleware.ts` matcher + `require-user.ts` in API |
| Add API route | `src/app/api/` — follow existing case routes |
| Add translation | `src/lib/i18n/translations.ts` (he + en) |
| Fix auth error | Check `AUTH_SECRET`, `DATABASE_URL` on Vercel |
| DB schema change | `prisma/schema.prisma` → `npm run db:push` |
| App icon | `src/app/icon.tsx`, `src/lib/branding/app-icon.tsx` |

---

## Files you will touch often

```
src/auth.ts                    Full NextAuth config
src/auth.config.ts             Edge-safe auth (middleware)
src/middleware.ts              Protects /cases/* and /api/cases/*
src/lib/db/prisma.ts           Lazy Prisma client
src/lib/analyzers/registry.ts  Analyzer registry
src/lib/i18n/translations.ts   All UI strings (HE/EN)
prisma/schema.prisma           Database schema
.env.example                   Documented env vars (not secrets)
```

---

## Known gaps / incomplete features

- `bank-report` analyzer: type exists, no implementation in registry
- `client-status` analyzer: `available: false`
- `AUTH_URL` in `.env.example` is documented but code uses `trustHost: true`
- Header "Sign in" button uses Google only; email users go to `/login`
- No Prisma migrations folder — schema sync via `db push` only

---

## Testing before finishing

```bash
npm run lint
npm run test          # Vitest unit tests
npm run build         # Must pass without DATABASE_URL (CI)
npm run test:e2e      # Playwright (needs build + port 3100 free)
```

---

## Further reading

- [`overview.md`](./overview.md) — project summary
- [`architecture.md`](./architecture.md) — structure and flows
- Topic docs in this folder for auth, DB, analyzers, cases, deployment
