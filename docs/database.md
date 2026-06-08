# Database

PostgreSQL hosted on **Prisma Postgres** (`db.prisma.io`), region `eu-central-1`.

## Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Models and enums |
| `prisma.config.ts` | Prisma 7 config, loads `DATABASE_URL` from dotenv |
| `src/lib/db/prisma.ts` | Lazy Prisma client + `isDatabaseConfigured()` |
| `src/generated/prisma/` | Generated client (gitignored, run `prisma generate`) |

## Schema models

### Auth (Auth.js adapter)

- `User` — `email`, optional `passwordHash`, `name`, `image`
- `Account` — OAuth provider accounts
- `Session` — adapter table (sessions use JWT, not DB sessions)
- `VerificationToken`

### Application

- `ClientCase` — tax case per user
  - `userId` → `User`
  - `clientName`, `clientIdNum?`, `taxYear`
  - `status`: `DRAFT | IN_PROGRESS | READY | FILED`
  - `notes?`

- `Document` — file attached to a case
  - `caseId` → `ClientCase`
  - `fileName`, `mimeType`, `fileData` (Bytes)
  - `blobUrl?` — optional Vercel Blob URL
  - `analyzerId`, `analysisJson?`, `status`: `PENDING | ANALYZED | ERROR`

## Lazy Prisma client

`src/lib/db/prisma.ts` exports a **Proxy** that only creates `PrismaClient` on first access:

```ts
export const prisma = new Proxy({} as PrismaClient, { get(...) { ... } });
```

**Why:** CI and `next build` run without `DATABASE_URL`. Importing `prisma` must not throw at module load time.

API routes check `isDatabaseConfigured()` and return `503` if missing.

## Prisma 7 specifics

- Driver adapter: `@prisma/adapter-pg` + `pg`
- Client output: `src/generated/prisma` (custom path, not `node_modules`)
- **No migrations folder** — schema synced with `prisma db push`
- Config file: `prisma.config.ts` (not only `schema.prisma`)

## Creating / claiming a database

Temporary DB via CLI:

```bash
npx create-db create -r eu-central-1 -e .env
```

- Writes `DATABASE_URL` and `CLAIM_URL` to `.env`
- **Unclaimed DBs are deleted after 24 hours**
- Claim at the URL in `CLAIM_URL` → login to Prisma → add to workspace
- After claim: manage at https://console.prisma.io

Free tier (approx.): 100k operations/month, 500 MB storage.

## Commands

```bash
npm run db:generate   # prisma generate
npm run db:push       # push schema to remote DB
npx prisma studio     # GUI at http://localhost:5555 (requires DATABASE_URL in .env)
```

**Vercel deploy** runs `prisma db push` automatically via `vercel-build` script.

## Ownership pattern

All case queries filter by authenticated user:

```ts
const userId = await requireAuthUserId();
const case = await getOwnedCase(caseId, userId);
```

Never expose another user's cases or documents.

## Document storage

1. **Always:** raw bytes in `Document.fileData` (Postgres)
2. **Optional:** duplicate to Vercel Blob if `BLOB_READ_WRITE_TOKEN` is set

File serving: `GET /api/cases/[id]/documents/[docId]/file` reads from DB or redirects to blob URL.
