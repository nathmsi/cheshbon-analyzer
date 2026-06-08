# Architecture

## Directory structure

```
cheshbon-analyzer/
├── docs/                         ← You are here (project documentation)
├── e2e/app.spec.ts               Playwright E2E tests
├── prisma/schema.prisma          Database models
├── prisma.config.ts              Prisma 7 config (dotenv + datasource URL)
├── public/samples/               Test Excel files for E2E and demos
├── scripts/generate-samples.mjs  Regenerate sample files
├── src/
│   ├── auth.ts                   NextAuth (full server config)
│   ├── auth.config.ts            NextAuth (edge/middleware)
│   ├── middleware.ts             Route protection
│   ├── app/                      Next.js App Router pages & API
│   ├── components/               React UI
│   ├── generated/prisma/         Generated Prisma client (gitignored)
│   ├── lib/                      Business logic
│   └── types/                    Type augmentations (e.g. next-auth.d.ts)
├── .github/workflows/ci.yml      CI pipeline
├── vercel.json                   Vercel deploy config
├── AGENTS.md                     Next.js 16 warning for AI
└── .env.example                  Env var template (no secrets)
```

## App Router pages

| Route | File | Auth |
|-------|------|------|
| `/` | `src/app/page.tsx` | Public |
| `/analyze/[type]` | `src/app/analyze/[type]/` | Public |
| `/cases` | `src/app/cases/page.tsx` | Required |
| `/cases/new` | `src/app/cases/new/page.tsx` | Required |
| `/cases/[id]` | `src/app/cases/[id]/page.tsx` | Required |
| `/login` | `src/app/login/` | Public |
| `/register` | `src/app/register/` | Public |

## API routes

| Method | Path | Purpose |
|--------|------|---------|
| `*` | `/api/auth/[...nextauth]` | Auth.js handlers |
| `POST` | `/api/auth/register` | Email/password registration |
| `GET`, `POST` | `/api/cases` | List / create cases |
| `GET`, `PATCH`, `DELETE` | `/api/cases/[id]` | Case CRUD |
| `POST` | `/api/cases/[id]/documents` | Upload + analyze document |
| `GET` | `/api/cases/[id]/documents/[docId]/file` | Download / preview file |

## Component organization

```
src/components/
├── analyze/          File upload, results, analyzer cards
├── auth/             Google sign-in, session provider, header auth button
├── cases/            Case detail, document preview modal
├── layout/           Header, footer, breadcrumbs, providers, i18n/theme toggles
└── ui/               Shared primitives (Button, Card, Badge)
```

## Library modules

```
src/lib/
├── analyzers/        Plugin registry, parsers, field extraction
├── auth/             Password hashing, require-user, google-configured check
├── branding/         App icon SVG (matches header logo)
├── cases/            Case summary builder, document file helpers
├── db/prisma.ts      Lazy Prisma client proxy
├── i18n/             language-context + translations.ts
├── theme/            theme-context
└── utils/            cn, format (currency, numbers, dates)
```

## Two analysis flows (critical)

### Flow A — Public local analysis

1. User visits `/analyze/pay-slip` (or other type)
2. `analyze-client.tsx` reads file in browser via `parseFile()`
3. Registered analyzer runs via `registry.ts`
4. Results shown in `analysis-results.tsx`
5. **No server upload, no database**

### Flow B — Authenticated case documents

1. User logs in, opens `/cases/[id]`
2. Uploads file via `case-detail-client.tsx`
3. `POST /api/cases/[id]/documents` receives multipart form
4. Server stores `fileData` in Postgres (always)
5. Optionally uploads to Vercel Blob if `BLOB_READ_WRITE_TOKEN` set
6. Server runs `analyzeFileBuffer()` and saves `analysisJson`
7. Case summary aggregates all document analyses

**Do not merge these flows** — privacy messaging on the homepage refers to Flow A only.

## Key patterns

### Path alias

`@/*` → `src/*` (see `tsconfig.json`)

### i18n

Custom React context — not `next-intl`. All strings in `translations.ts` under `he` and `en` keys.

### Client providers

`src/components/layout/app-providers.tsx` wraps:
- ThemeProvider
- LanguageProvider
- SessionProvider (next-auth)

### Row-level security

Cases belong to `userId`. API routes use `getOwnedCase(caseId, userId)` — never trust client-provided user IDs.

### Lazy Prisma

See [`database.md`](./database.md). Build and CI work without `DATABASE_URL`.

## ESLint ignores

- `src/generated/**`
- `public/pdf.worker.mjs`
