import type { Locale } from "@/lib/i18n/translations";
import { translations } from "@/lib/i18n/translations";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import type { AnalysisResult, AnalyzerDefinition, ParsedWorkbook } from "./types";

export function analyzeClientStatus(
  workbook: ParsedWorkbook,
  locale: Locale,
): AnalysisResult {
  const t = translations[locale];

  let totalNumericValues = 0;
  let sum = 0;
  let max = 0;
  let min = Infinity;
  let textFields = 0;

  for (const rows of Object.values(workbook.sheets)) {
    for (const row of rows) {
      for (const cell of row) {
        if (!cell) continue;
        const num = parseFloat(cell.replace(/,/g, "").replace(/[₪]/g, ""));
        if (!isNaN(num) && num !== 0) {
          totalNumericValues++;
          sum += num;
          max = Math.max(max, Math.abs(num));
          min = Math.min(min, Math.abs(num));
        } else if (cell.length > 2) {
          textFields++;
        }
      }
    }
  }

  const insights: AnalysisResult["insights"] = [
    {
      type: "info",
      message:
        locale === "he"
          ? `נמצאו ${formatNumber(totalNumericValues, locale)} ערכים מספריים ו-${formatNumber(textFields, locale)} שדות טקסט`
          : `Found ${formatNumber(totalNumericValues, locale)} numeric values and ${formatNumber(textFields, locale)} text fields`,
    },
  ];

  return {
    analyzerId: "client-status",
    fileName: "",
    analyzedAt: new Date().toISOString(),
    confidence: totalNumericValues > 5 ? "medium" : "low",
    summary: {
      title: t.analyzers["client-status"].title,
      kpis: [
        {
          label: locale === "he" ? "גיליונות" : "Sheets",
          value: String(workbook.sheetNames.length),
        },
        {
          label: t.results.rows,
          value: formatNumber(workbook.totalRows, locale),
        },
        totalNumericValues > 0
          ? {
              label: locale === "he" ? "ערך מקסימלי" : "Max Value",
              value: formatCurrency(max, locale),
              highlight: true,
            }
          : null,
      ].filter(Boolean) as AnalysisResult["summary"]["kpis"],
    },
    sections: workbook.sheetNames.map((name) => ({
      id: name,
      title: name,
      fields: [
        {
          key: "rows",
          label: t.results.rows,
          value: workbook.sheets[name]?.length ?? 0,
          type: "number" as const,
          confidence: "high" as const,
        },
      ],
    })),
    insights,
    meta: {
      sheets: workbook.sheetNames,
      totalRows: workbook.totalRows,
      detectedFormat: "client-status",
    },
  };
}

export const clientStatusAnalyzer: AnalyzerDefinition = {
  id: "client-status",
  icon: "users",
  available: false,
  analyze: analyzeClientStatus,
};
