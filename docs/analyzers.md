# Analyzers

Extensible plugin system for document analysis. Each analyzer implements a common interface and is registered centrally.

## Core files

| File | Purpose |
|------|---------|
| `src/lib/analyzers/types.ts` | `AnalyzerId`, `AnalyzerDefinition`, `AnalysisResult` |
| `src/lib/analyzers/registry.ts` | Registry + `getAnalyzer()`, `caseDocumentTypes` |
| `src/lib/analyzers/excel-parser.ts` | Browser `parseFile()` for xlsx/xls/csv/pdf |
| `src/lib/analyzers/parse-buffer.ts` | Server `parseBuffer()` + `analyzeFileBuffer()` |
| `src/lib/analyzers/pdf-parser.ts` | PDF text extraction with position clustering |
| `src/lib/analyzers/field-extractor.ts` | Shared Hebrew/English field patterns |

## Registered analyzers

| ID | File | Available |
|----|------|-----------|
| `pay-slip` | `pay-slip.ts` | ✅ |
| `form-106` | `form-106.ts` | ✅ |
| `advance-tax` | `advance-tax.ts` | ✅ |
| `national-insurance` | `national-insurance.ts` | ✅ |
| `generic` | `generic.ts` | ✅ |
| `client-status` | `client-status.ts` | ❌ (`available: false`) |
| `bank-report` | *(not implemented)* | — type only in `caseDocumentTypes` |

## Analyzer interface

```ts
type AnalyzerDefinition = {
  id: AnalyzerId;
  icon: LucideIcon;
  available: boolean;
  analyze(workbook: ParsedWorkbook, locale: "he" | "en"): AnalysisResult;
};
```

## AnalysisResult shape

- `title`, `confidence` (`high` | `medium` | `low`)
- `kpis[]` — summary numbers
- `sections[]` — grouped fields with values and confidence
- `insights[]` — auto-generated warnings/tips
- `meta` — employee name, period, etc.

## Parsing pipeline

### Client (public pages)

```
File input → parseFile() → workbook/sheets
           → registry[id].analyze(workbook, locale)
           → AnalysisResults component
```

### Server (case uploads)

```
multipart upload → Buffer
                 → parseBuffer(buffer, mimeType, fileName)
                 → analyzeFileBuffer(buffer, analyzerId, locale)
                 → save analysisJson to Document
```

## PDF support

- Uses `pdfjs-dist` with worker at `public/pdf.worker.mjs`
- Worker copied on `postinstall` from `node_modules/pdfjs-dist`
- Custom layout parser groups text items into rows/columns

## Sample files

| File | Used for |
|------|----------|
| `public/samples/sample-pay-slip.xlsx` | E2E tests, demo |
| `public/samples/sample-form-106.xlsx` | Demo |

Regenerate: `npm run generate-samples` → `scripts/generate-samples.mjs`

Expected pay-slip values (E2E): gross 18,500 · net 14,205 · employee יוסי כהן

## Adding a new analyzer

1. Create `src/lib/analyzers/my-analyzer.ts`:
   ```ts
   export const myAnalyzer: AnalyzerDefinition = {
     id: "my-id",
     icon: SomeIcon,
     available: true,
     analyze(workbook, locale) { ... return result; },
   };
   ```

2. Register in `src/lib/analyzers/registry.ts`

3. Add Hebrew + English strings in `src/lib/i18n/translations.ts`:
   - `analyzers.myId.title`, `.description`, etc.

4. Optionally add to `caseDocumentTypes` for case upload recommendations

5. Add unit tests in `src/lib/analyzers/__tests__/`

## Tests

```bash
npm run test   # runs Vitest
```

- `analyzer-precision.test.ts` — field extraction accuracy
- `pdf-parser.test.ts` — PDF parsing
- Fixtures: `src/lib/analyzers/__fixtures__/sample-data.ts`

## UI integration

- Home page: `analyzer-card.tsx` with links to `/analyze/[type]`
- Analyze page: `analyze-client.tsx` + `file-upload-zone.tsx` + `analysis-results.tsx`
- Case upload: user picks analyzer in `case-detail-client.tsx`

**Preserve `data-testid` attributes** when editing results/upload UI (E2E depends on them).
