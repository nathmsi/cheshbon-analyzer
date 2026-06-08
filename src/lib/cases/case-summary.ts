import type { AnalysisResult } from "@/lib/analyzers/types";
import { formatCurrency } from "@/lib/utils/format";

type StoredDocument = {
  id: string;
  fileName: string;
  analyzerId: string;
  status: string;
  analysisJson: AnalysisResult | null;
};

export type CaseSummaryResult = {
  clientName: string;
  taxYear: number;
  documentCount: number;
  analyzedCount: number;
  kpis: Array<{ label: string; value: string; highlight?: boolean; source?: string }>;
  insights: Array<{ type: "info" | "warning" | "success"; message: string }>;
  documents: Array<{
    id: string;
    fileName: string;
    analyzerId: string;
    status: string;
    topKpi?: string;
  }>;
  readyForFiling: boolean;
};

function extractNumericFromAnalysis(
  analysis: AnalysisResult,
  keys: string[],
): number | null {
  for (const section of analysis.sections) {
    for (const field of section.fields) {
      if (keys.includes(field.key) && typeof field.value === "number") {
        return field.value;
      }
    }
  }
  for (const kpi of analysis.summary.kpis) {
    const num = parseFloat(kpi.value.replace(/[^\d.-]/g, ""));
    if (!isNaN(num) && keys.some((k) => kpi.label.toLowerCase().includes(k))) {
      return num;
    }
  }
  return null;
}

export function buildCaseSummary(
  clientName: string,
  taxYear: number,
  documents: StoredDocument[],
  locale: "he" | "en" = "he",
): CaseSummaryResult {
  const analyzed = documents.filter(
    (d) => d.status === "ANALYZED" && d.analysisJson,
  );

  let totalIncome: number | null = null;
  let totalTaxPaid: number | null = null;
  let totalAdvance: number | null = null;
  let totalNI: number | null = null;
  let totalGross: number | null = null;

  const insights: CaseSummaryResult["insights"] = [];

  for (const doc of analyzed) {
    const a = doc.analysisJson!;
    if (doc.analyzerId === "form-106") {
      totalIncome =
        extractNumericFromAnalysis(a, ["totalIncome", "taxableIncome"]) ??
        totalIncome;
      totalTaxPaid =
        extractNumericFromAnalysis(a, ["taxPaid", "incomeTax"]) ?? totalTaxPaid;
    }
    if (doc.analyzerId === "pay-slip") {
      const gross = extractNumericFromAnalysis(a, ["grossSalary"]);
      if (gross) totalGross = (totalGross ?? 0) + gross;
    }
    if (doc.analyzerId === "advance-tax") {
      const adv = extractNumericFromAnalysis(a, ["totalAdvancePaid"]);
      if (adv) totalAdvance = (totalAdvance ?? 0) + adv;
    }
    if (doc.analyzerId === "national-insurance") {
      const ni = extractNumericFromAnalysis(a, ["totalNI", "nationalInsurance"]);
      if (ni) totalNI = (totalNI ?? 0) + ni;
    }
    insights.push(...a.insights.slice(0, 1));
  }

  const kpis: CaseSummaryResult["kpis"] = [];

  if (totalIncome !== null) {
    kpis.push({
      label: locale === "he" ? "הכנסות (106)" : "Income (106)",
      value: formatCurrency(totalIncome, locale),
      highlight: true,
      source: "form-106",
    });
  }
  if (totalTaxPaid !== null) {
    kpis.push({
      label: locale === "he" ? "מס שנוכה" : "Tax withheld",
      value: formatCurrency(totalTaxPaid, locale),
      highlight: true,
      source: "form-106",
    });
  }
  if (totalAdvance !== null) {
    kpis.push({
      label: locale === "he" ? "מקדמות" : "Advance tax",
      value: formatCurrency(totalAdvance, locale),
      source: "advance-tax",
    });
  }
  if (totalNI !== null) {
    kpis.push({
      label: locale === "he" ? "ביטוח לאומי" : "National insurance",
      value: formatCurrency(totalNI, locale),
      source: "national-insurance",
    });
  }

  const has106 = analyzed.some((d) => d.analyzerId === "form-106");
  const readyForFiling = has106 && analyzed.length >= 2;

  if (readyForFiling) {
    insights.unshift({
      type: "success",
      message:
        locale === "he"
          ? "התיק מכיל מספיק מסמכים — מוכן לעבודה על הdeclaration"
          : "Case has enough documents — ready for tax declaration work",
    });
  } else if (analyzed.length === 0) {
    insights.unshift({
      type: "warning",
      message:
        locale === "he"
          ? "העלה מסמכים ונתח אותם כדי לקבל סיכום תיק"
          : "Upload and analyze documents to get case summary",
    });
  } else if (!has106) {
    insights.unshift({
      type: "warning",
      message:
        locale === "he"
          ? "חסר טופס 106 — מומלץ להוסיף לסיכום מלא"
          : "Missing Form 106 — add for complete summary",
    });
  }

  return {
    clientName,
    taxYear,
    documentCount: documents.length,
    analyzedCount: analyzed.length,
    kpis,
    insights: insights.slice(0, 6),
    documents: documents.map((d) => ({
      id: d.id,
      fileName: d.fileName,
      analyzerId: d.analyzerId,
      status: d.status,
      topKpi: d.analysisJson?.summary.kpis[0]?.value,
    })),
    readyForFiling,
  };
}
