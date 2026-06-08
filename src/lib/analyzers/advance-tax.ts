import type { Locale } from "@/lib/i18n/translations";
import { translations } from "@/lib/i18n/translations";
import { formatCurrency } from "@/lib/utils/format";
import {
  extractFieldsFromWorkbook,
  type FieldPattern,
} from "./field-extractor";
import type { AnalysisResult, AnalyzerDefinition, ParsedWorkbook } from "./types";

const ADVANCE_TAX_PATTERNS: FieldPattern[] = [
  { key: "employeeName", labels: ["שם", "שם עובד", "employee", "name"], type: "text" },
  { key: "employeeId", labels: ["ת.ז", "ת.ז.", "id"], type: "text" },
  { key: "taxYear", labels: ["שנת מס", "שנה", "year", "tax year"], type: "text" },
  {
    key: "totalAdvancePaid",
    labels: [
      "סה\"כ מקדמות",
      "מקדמות ששולמו",
      "total advance",
      "advance tax paid",
      "מס מקדמות",
    ],
    type: "currency",
  },
  {
    key: "monthlyAdvance",
    labels: ["מקדמה חודשית", "monthly advance", "תשלום חודשי"],
    type: "currency",
  },
  {
    key: "remainingBalance",
    labels: ["יתרה", "balance", "יתרת מקדמות"],
    type: "currency",
  },
  {
    key: "paymentCount",
    labels: ["מספר תשלומים", "payments", "תשלומים"],
    type: "number",
  },
];

function buildFields(
  fields: ReturnType<typeof extractFieldsFromWorkbook>,
  keys: string[],
  locale: Locale,
) {
  const t = translations[locale].fields;
  return keys
    .filter((k) => fields.has(k))
    .map((key) => {
      const data = fields.get(key)!;
      const pattern = ADVANCE_TAX_PATTERNS.find((p) => p.key === key);
      return {
        key,
        label: t[key as keyof typeof t] ?? key,
        value: data.value,
        type: pattern?.type ?? "text",
        confidence: data.confidence,
        source: data.source,
      };
    });
}

export function analyzeAdvanceTax(
  workbook: ParsedWorkbook,
  locale: Locale,
): AnalysisResult {
  const t = translations[locale];
  const fields = extractFieldsFromWorkbook(workbook, ADVANCE_TAX_PATTERNS);

  const total = fields.get("totalAdvancePaid")?.value;
  const totalNum = typeof total === "number" ? total : null;

  const insights: AnalysisResult["insights"] = [];
  if (totalNum !== null) {
    insights.push({
      type: "info",
      message:
        locale === "he"
          ? `סה"כ מקדמות שזוהו: ${formatCurrency(totalNum, locale)}`
          : `Total advance tax detected: ${formatCurrency(totalNum, locale)}`,
    });
  }

  return {
    analyzerId: "advance-tax",
    fileName: "",
    analyzedAt: new Date().toISOString(),
    confidence: fields.size >= 2 ? "medium" : "low",
    summary: {
      title: t.analyzers["advance-tax"].title,
      kpis: totalNum
        ? [
            {
              label: locale === "he" ? "מקדמות ששולמו" : "Advance tax paid",
              value: formatCurrency(totalNum, locale),
              highlight: true,
            },
          ]
        : [],
    },
    sections: [
      {
        id: "info",
        title: locale === "he" ? "פרטי מקדמות" : "Advance tax details",
        fields: buildFields(
          fields,
          ["employeeName", "employeeId", "taxYear", "totalAdvancePaid", "monthlyAdvance", "remainingBalance", "paymentCount"],
          locale,
        ),
      },
    ].filter((s) => s.fields.length > 0),
    insights,
    meta: {
      sheets: workbook.sheetNames,
      totalRows: workbook.totalRows,
      detectedFormat: "advance-tax",
    },
  };
}

export const advanceTaxAnalyzer: AnalyzerDefinition = {
  id: "advance-tax",
  icon: "landmark",
  available: true,
  analyze: analyzeAdvanceTax,
};
