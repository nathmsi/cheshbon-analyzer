# Cases & Documents

Authenticated **client case (תיק)** management for accountants.

## Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/cases` | `cases/page.tsx` | List user's cases |
| `/cases/new` | `cases/new/page.tsx` | Create case form |
| `/cases/[id]` | `case-detail-client.tsx` | Case detail + documents |

All require login (middleware redirect).

## Case fields

- **Client name** (`clientName`) — required
- **ID number** (`clientIdNum`) — optional (ת.ז.)
- **Tax year** (`taxYear`) — e.g. 2024
- **Status** — `DRAFT` → `IN_PROGRESS` → `READY` → `FILED`
- **Notes** — free text

Each case belongs to exactly one `userId`.

## Document workflow

1. User opens case detail
2. Selects analyzer type + uploads file
3. `POST /api/cases/[id]/documents` (multipart):
   - Validates ownership
   - Saves `fileData` to Postgres
   - Optionally uploads to Vercel Blob
   - Runs server-side analysis
   - Stores result in `analysisJson`
   - Sets `status` to `ANALYZED` or `ERROR`
4. UI refreshes document list and case summary

## Case summary

`src/lib/cases/case-summary.ts` — `buildCaseSummary(documents)`:
- Aggregates KPIs across analyzed documents
- Surfaces cross-document insights
- Shown on case detail page

## Document preview & download

| Action | Implementation |
|--------|----------------|
| Preview PDF/image | `document-preview-modal.tsx` — iframe or img |
| Open in new tab | Link to `/api/cases/.../file` |
| Download | Same file endpoint with `Content-Disposition: attachment` |

File route: `src/app/api/cases/[id]/documents/[docId]/file/route.ts`
- Verifies case ownership
- Serves from `fileData` or redirects to `blobUrl`

Helpers: `src/lib/cases/document-file.ts`

## API summary

### `GET /api/cases`

Returns current user's cases (newest first).

### `POST /api/cases`

Body: `{ clientName, clientIdNum?, taxYear, notes? }`

### `GET/PATCH/DELETE /api/cases/[id]`

Single case CRUD — ownership enforced.

### `POST /api/cases/[id]/documents`

Form fields: `file`, `analyzerId`

### `GET /api/cases/[id]/documents/[docId]/file`

Returns file bytes with correct `Content-Type`.

## Error handling

- No `DATABASE_URL`: all case APIs return `503`
- Unauthorized: `401`
- Case not found / not owned: `404`
- Analysis failure: document `status: ERROR`, error stored in metadata

## i18n keys

Case UI strings under `translations.cases` (Hebrew + English):
- list, new, detail labels
- upload, preview, download, open actions
- status labels

## E2E coverage

Case flows are **not** covered by E2E yet (auth required). E2E focuses on public analyze flow in `e2e/app.spec.ts`.

When adding case E2E tests, consider test user seeding or auth bypass for CI.
