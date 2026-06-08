import type { DohShnatiDraft } from "./doh-shnati-draft";
import type { Locale } from "@/lib/i18n/translations";

function statusLabel(status: string, locale: Locale): string {
  const he: Record<string, string> = {
    ok: "תקין",
    warning: "שים לב",
    error: "פער",
    info: "מידע",
  };
  const en: Record<string, string> = {
    ok: "OK",
    warning: "Warning",
    error: "Gap",
    info: "Info",
  };
  return locale === "he" ? he[status] ?? status : en[status] ?? status;
}

export function buildDohShnatiPrintHtml(draft: DohShnatiDraft, locale: Locale): string {
  const isRtl = locale === "he";
  const dir = isRtl ? "rtl" : "ltr";
  const title = isRtl ? "דוח שנתי — טיוטה" : "Annual report — draft";
  const profileLabel =
    draft.clientProfile === "EMPLOYEE"
      ? isRtl
        ? "שכיר"
        : "Employee"
      : isRtl
        ? "עצמאי"
        : "Self-employed";

  const rows = draft.draftRows
    .map(
      (r) =>
        `<tr><td>${isRtl ? r.labelHe : r.labelEn}</td><td><strong>${r.value}</strong></td><td>${r.source ?? ""}</td></tr>`,
    )
    .join("");

  const checks = draft.crossChecks
    .map(
      (c) =>
        `<li><strong>[${statusLabel(c.status, locale)}]</strong> ${isRtl ? c.messageHe : c.messageEn}</li>`,
    )
    .join("");

  const paySlipRows = draft.paySlips
    .filter((p) => p.gross !== null)
    .map(
      (p) =>
        `<tr><td>${p.month}</td><td>${p.fileName ?? "—"}</td><td>${p.gross ?? "—"}</td><td>${p.incomeTax ?? "—"}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <title>${title} — ${draft.clientName}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; color: #111; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .meta { color: #555; margin-bottom: 1.5rem; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }
    th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: ${isRtl ? "right" : "left"}; }
    th { background: #f0f4f8; }
    ul { padding-${isRtl ? "right" : "left"}: 1.25rem; }
    @media print { body { padding: 0.5rem; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="meta">${draft.clientName} · ${isRtl ? "שנת מס" : "Tax year"} ${draft.taxYear}${draft.clientIdNum ? ` · ${draft.clientIdNum}` : ""} · ${profileLabel}</p>
  <p>${isRtl ? "השלמת מסמכים" : "Document completion"}: ${draft.checklist.completionPercent}% (${draft.checklist.requiredFulfilled}/${draft.checklist.requiredTotal} ${isRtl ? "חובה" : "required"})</p>

  <h2>${isRtl ? "סיכום שדות" : "Field summary"}</h2>
  <table>
    <thead><tr><th>${isRtl ? "שדה" : "Field"}</th><th>${isRtl ? "ערך" : "Value"}</th><th>${isRtl ? "מקור" : "Source"}</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="3">${isRtl ? "אין נתונים עדיין" : "No data yet"}</td></tr>`}</tbody>
  </table>

  <h2>${isRtl ? "בקרות" : "Cross-checks"}</h2>
  <ul>${checks || `<li>${isRtl ? "אין בקרות" : "No checks"}</li>`}</ul>

  ${
    paySlipRows
      ? `<h2>${isRtl ? "תלושי שכר" : "Pay slips"}</h2>
  <table>
    <thead><tr><th>${isRtl ? "חודש" : "Month"}</th><th>${isRtl ? "קובץ" : "File"}</th><th>${isRtl ? "ברוטו" : "Gross"}</th><th>${isRtl ? "מס" : "Tax"}</th></tr></thead>
    <tbody>${paySlipRows}</tbody>
  </table>`
      : ""
  }

  <p style="margin-top:2rem;font-size:0.75rem;color:#666">${isRtl ? "טיוטה לעיון — לא להגשה רשמית" : "Draft for review — not for official filing"}</p>
</body>
</html>`;
}

export function openDohShnatiPrintWindow(draft: DohShnatiDraft, locale: Locale): void {
  const html = buildDohShnatiPrintHtml(draft, locale);
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}
