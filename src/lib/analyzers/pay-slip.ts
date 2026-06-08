import type { Locale } from "@/lib/i18n/translations";
import { translations } from "@/lib/i18n/translations";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format";
import {
  extractFieldsFromWorkbook,
  PAY_SLIP_PATTERNS,
} from "./field-extractor";
import type { AnalysisResult, AnalyzerDefinition, ParsedWorkbook } from "./types";

function getNumeric(
  fields: Map<string, { value: string | number }>,
  key: string,
): number | null {
  const val = fields.get(key)?.value;
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const num = parseFloat(val.replace(/,/g, ""));
    return isNaN(num) ? null : num;
  }
  return null;
}

function buildFieldValues(
  fields: Map<
    string,
    { value: string | number; confidence: "high" | "medium" | "low"; source: string }
  >,
  keys: string[],
  locale: Locale,
): AnalysisResult["sections"][0]["fields"] {
  const t = translations[locale].fields;
  return keys
    .filter((key) => fields.has(key))
    .map((key) => {
      const data = fields.get(key)!;
      const label = t[key as keyof typeof t] ?? key;
      const pattern = PAY_SLIP_PATTERNS.find((p) => p.key === key);

      return {
        key,
        label,
        value: data.value,
        type: pattern?.type ?? "text",
        confidence: data.confidence,
        source: data.source,
      };
    });
}

export function analyzePaySlip(
  workbook: ParsedWorkbook,
  locale: Locale,
): AnalysisResult {
  const t = translations[locale];
  const fields = extractFieldsFromWorkbook(workbook, PAY_SLIP_PATTERNS);

  const gross = getNumeric(fields, "grossSalary");
  const net = getNumeric(fields, "netSalary");
  const incomeTax = getNumeric(fields, "incomeTax");
  const nationalInsurance = getNumeric(fields, "nationalInsurance");
  const healthTax = getNumeric(fields, "healthTax");
  const pension = getNumeric(fields, "pension");
  const studyFund = getNumeric(fields, "studyFund");

  const deductions = [incomeTax, nationalInsurance, healthTax, pension, studyFund]
    .filter((v): v is number => v !== null)
    .reduce((sum, v) => sum + Math.abs(v), 0);

  const totalDeductions =
    gross !== null && net !== null ? gross - net : deductions > 0 ? deductions : null;

  const effectiveTaxRate =
    gross && incomeTax ? Math.abs((incomeTax / gross) * 100) : null;
  const deductionRate =
    gross && totalDeductions ? (totalDeductions / gross) * 100 : null;

  const insights: AnalysisResult["insights"] = [];

  if (gross !== null && net !== null) {
    insights.push({
      type: "success",
      message:
        locale === "he"
          ? `שכר נטו הוא ${formatPercent((net / gross) * 100, locale)} מהברוטו`
          : `Net salary is ${formatPercent((net / gross) * 100, locale)} of gross`,
    });
  }

  if (effectiveTaxRate !== null && effectiveTaxRate > 35) {
    insights.push({
      type: "warning",
      message:
        locale === "he"
          ? `שיעור מס הכנסה גבוה (${formatPercent(effectiveTaxRate, locale)}) — כדאי לבדוק נקודות זיכוי`
          : `High income tax rate (${formatPercent(effectiveTaxRate, locale)}) — check tax credit points`,
    });
  }

  if (pension !== null && gross !== null) {
    const pensionRate = (Math.abs(pension) / gross) * 100;
    if (pensionRate < 6) {
      insights.push({
        type: "warning",
        message:
          locale === "he"
            ? `הפרשה לפנסיה נמוכה (${formatPercent(pensionRate, locale)}) — מינימום מומלץ 6%`
            : `Low pension contribution (${formatPercent(pensionRate, locale)}) — recommended minimum 6%`,
      });
    }
  }

  if (fields.size === 0) {
    insights.push({
      type: "warning",
      message:
        locale === "he"
          ? "לא זוהו שדות מוכרים — ייתכן שהפורמט שונה מהצפוי"
          : "No recognized fields found — format may differ from expected",
    });
  }

  const highConfidenceCount = [...fields.values()].filter(
    (f) => f.confidence === "high",
  ).length;
  const confidence: AnalysisResult["confidence"] =
    highConfidenceCount >= 4
      ? "high"
      : fields.size >= 2
        ? "medium"
        : "low";

  const kpis = [
    gross !== null
      ? { label: t.results.grossSalary, value: formatCurrency(gross, locale), highlight: true }
      : null,
    net !== null
      ? { label: t.results.netSalary, value: formatCurrency(net, locale), highlight: true }
      : null,
    totalDeductions !== null
      ? {
          label: t.results.totalDeductions,
          value: formatCurrency(totalDeductions, locale),
        }
      : null,
    effectiveTaxRate !== null
      ? {
          label: t.results.effectiveTaxRate,
          value: formatPercent(effectiveTaxRate, locale),
        }
      : null,
  ].filter(Boolean) as AnalysisResult["summary"]["kpis"];

  const employeeName = fields.get("employeeName")?.value;

  return {
    analyzerId: "pay-slip",
    fileName: "",
    analyzedAt: new Date().toISOString(),
    confidence,
    summary: {
      title:
        typeof employeeName === "string"
          ? `${t.analyzers["pay-slip"].title} — ${employeeName}`
          : t.analyzers["pay-slip"].title,
      kpis,
    },
    sections: [
      {
        id: "employee",
        title: t.results.employeeInfo,
        fields: buildFieldValues(
          fields,
          ["employeeName", "employeeId", "month", "year"],
          locale,
        ),
      },
      {
        id: "employer",
        title: t.results.employerInfo,
        fields: buildFieldValues(fields, ["employerName", "employerId"], locale),
      },
      {
        id: "salary",
        title: t.results.salaryBreakdown,
        fields: buildFieldValues(
          fields,
          ["grossSalary", "netSalary", "overtime", "bonus", "travel"],
          locale,
        ),
      },
      {
        id: "taxes",
        title: t.results.taxes,
        fields: buildFieldValues(
          fields,
          ["incomeTax", "nationalInsurance", "healthTax"],
          locale,
        ),
      },
      {
        id: "deductions",
        title: t.results.deductions,
        fields: buildFieldValues(
          fields,
          ["pension", "studyFund", "compensation", "otherDeductions"],
          locale,
        ),
      },
    ].filter((section) => section.fields.length > 0),
    insights,
    meta: {
      sheets: workbook.sheetNames,
      totalRows: workbook.totalRows,
      detectedFormat: "pay-slip",
    },
  };
}

export const paySlipAnalyzer: AnalyzerDefinition = {
  id: "pay-slip",
  icon: "receipt",
  available: true,
  analyze: analyzePaySlip,
};
