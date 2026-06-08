# Cheshbon Analyzer — Documentation

> **For AI agents:** start with [`for-ai-agents.md`](./for-ai-agents.md), then read the topic files below as needed.

Web app for **Israeli accountants** (Hebrew RTL + English). Upload Excel/CSV/PDF files for instant analysis, or manage **client cases (תיקים)** with authenticated document storage.

**Production:** https://cheshbon-analyzer.vercel.app  
**Repo:** https://github.com/nathmsi/cheshbon-analyzer

---

## Documentation index

| File | Contents |
|------|----------|
| [`for-ai-agents.md`](./for-ai-agents.md) | Rules, gotchas, and workflow for AI coding agents |
| [`overview.md`](./overview.md) | Purpose, stack, high-level architecture |
| [`architecture.md`](./architecture.md) | Directory map, two analysis flows, key patterns |
| [`authentication.md`](./authentication.md) | Auth.js, Google OAuth, email/password, middleware |
| [`database.md`](./database.md) | Prisma schema, Postgres cloud, lazy client |
| [`analyzers.md`](./analyzers.md) | Pluggable analyzer system and parsers |
| [`cases-and-documents.md`](./cases-and-documents.md) | Client cases, uploads, preview, API |
| [`deployment-and-ci.md`](./deployment-and-ci.md) | Vercel, GitHub Actions, env vars |
| [`development.md`](./development.md) | Scripts, tests, local setup, adding features |

**Cursor rules (auto-applied by IDE):** `.cursor/rules/` — see `e2e-required.mdc` for mandatory E2E on new features.

---

## Quick orientation

```
Public pages (/analyze/*)     →  analysis runs in the browser (no upload)
Protected pages (/cases/*)    →  auth required, files stored in Postgres
```

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind 4 · Prisma 7 · Auth.js v5 · Vitest · Playwright

**Before editing Next.js code:** read `AGENTS.md` — this project uses Next.js 16 with breaking changes vs older versions.
