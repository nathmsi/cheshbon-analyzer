import type { Locale } from "@/lib/i18n/translations";
import { translations } from "@/lib/i18n/translations";
import { formatCurrency } from "@/lib/utils/format";
import {
  extractFieldsFromWorkbook,
  type FieldPattern,
} from "./field-extractor";
import type { AnalysisResult, AnalyzerDefinition, ParsedWorkbook } from "./types";

const NI_PATTERNS: FieldPattern[] = [
  { key: "employeeName", labels: ["שם", "שם עובד", "name"], type: "text" },
  { key: "employeeId", labels: ["ת.ז", "ת.ז.", "id"], type: "text" },
  { key: "taxYear", labels: ["שנת מס", "שנה", "year"], type: "text" },
  {
    key: "totalNI",
    labels: [
      "סה\"כ ביטוח לאומי",
      "ביטוח לאומי",
      "national insurance",
      "total ni",
      "דמי ביטוח",
    ],
    type: "currency",
  },
  {
    key: "employeeNI",
    labels: ["חלק עובד", "employee share", "ניכוי עובד"],
    type: "currency",
  },
  {
    key: "employerNI",
    labels: ["חלק מעסיק", "employer share", "הפרשת מעסיק"],
    type: "currency",
  },
  {
    key: "healthTax",
    labels: ["מס בריאות", "health tax"],
    type: "currency",
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
      const pattern = NI_PATTERNS.find((p) => p.key === key);
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

export function analyzeNationalInsurance(
  workbook: ParsedWorkbook,
  locale: Locale,
): AnalysisResult {
  const t = translations[locale];
  const fields = extractFieldsFromWorkbook(workbook, NI_PATTERNS);

  const total = fields.get("totalNI")?.value;
  const totalNum = typeof total === "number" ? total : null;

  return {
    analyzerId: "national-insurance",
    fileName: "",
    analyzedAt: new Date().toISOString(),
    confidence: fields.size >= 2 ? "medium" : "low",
    summary: {
      title: t.analyzers["national-insurance"].title,
      kpis: totalNum
        ? [
            {
              label: t.fields.nationalInsurance,
              value: formatCurrency(totalNum, locale),
              highlight: true,
            },
          ]
        : [],
    },
    sections: [
      {
        id: "ni",
        title: locale === "he" ? "ביטוח לאומי ובריאות" : "National insurance & health",
        fields: buildFields(
          fields,
          ["employeeName", "employeeId", "taxYear", "totalNI", "employeeNI", "employerNI", "healthTax"],
          locale,
        ),
      },
    ].filter((s) => s.fields.length > 0),
    insights: totalNum
      ? [
          {
            type: "info" as const,
            message:
              locale === "he"
                ? `סה"כ ביטוח לאומי: ${formatCurrency(totalNum, locale)}`
                : `Total national insurance: ${formatCurrency(totalNum, locale)}`,
          },
        ]
      : [],
    meta: {
      sheets: workbook.sheetNames,
      totalRows: workbook.totalRows,
      detectedFormat: "national-insurance",
    },
  };
}

export const nationalInsuranceAnalyzer: AnalyzerDefinition = {
  id: "national-insurance",
  icon: "shield",
  available: true,
  analyze: analyzeNationalInsurance,
};
