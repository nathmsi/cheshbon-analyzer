import type { Locale } from "@/lib/i18n/translations";
import { translations } from "@/lib/i18n/translations";
import { formatNumber } from "@/lib/utils/format";
import { getAllCells } from "./excel-parser";
import type { AnalysisResult, AnalyzerDefinition, FieldValue, ParsedWorkbook } from "./types";

export function analyzeGeneric(
  workbook: ParsedWorkbook,
  locale: Locale,
): AnalysisResult {
  const t = translations[locale];
  const cells = getAllCells(workbook);

  const headerCandidates = new Map<string, number>();

  for (const [sheetName, rows] of Object.entries(workbook.sheets)) {
    if (rows.length === 0) continue;
    const headerRow = rows[0];
    headerRow.forEach((cell, colIndex) => {
      if (cell && cell.length > 1 && cell.length < 50) {
        const key = cell;
        if (!headerCandidates.has(key)) {
          // Sample first data row
          const sampleValue = rows[1]?.[colIndex] ?? "";
          headerCandidates.set(key, colIndex);
        }
      }
    });
  }

  const fields: FieldValue[] = [];

  for (const [sheetName, rows] of Object.entries(workbook.sheets)) {
    if (rows.length < 2) continue;
    const headers = rows[0];

    headers.forEach((header, colIndex) => {
      if (!header) return;
      const values = rows
        .slice(1)
        .map((row) => row[colIndex])
        .filter(Boolean);

      if (values.length === 0) return;

      const numValues = values
        .map((v) => parseFloat(v.replace(/,/g, "")))
        .filter((n) => !isNaN(n));

      const isNumeric = numValues.length > values.length * 0.5;
      const displayValue = isNumeric
        ? numValues.reduce((a, b) => a + b, 0)
        : values[0];

      fields.push({
        key: `${sheetName}-${colIndex}`,
        label: header,
        value: displayValue,
        type: isNumeric ? "number" : "text",
        confidence: values.length > 1 ? "medium" : "low",
        source: sheetName,
      });
    });
  }

  return {
    analyzerId: "generic",
    fileName: "",
    analyzedAt: new Date().toISOString(),
    confidence: fields.length > 3 ? "medium" : "low",
    summary: {
      title: t.analyzers.generic.title,
      kpis: [
        { label: t.results.sheets, value: String(workbook.sheetNames.length) },
        { label: t.results.rows, value: formatNumber(workbook.totalRows, locale) },
        {
          label: t.results.fieldsFound,
          value: String(fields.length),
          highlight: true,
        },
      ],
    },
    sections: [
      {
        id: "detected",
        title: t.results.fieldsFound,
        fields: fields.slice(0, 30),
      },
    ],
    insights: [
      {
        type: "info",
        message:
          locale === "he"
            ? `זוהו ${fields.length} עמודות ב-${workbook.sheetNames.length} גיליונות`
            : `Detected ${fields.length} columns across ${workbook.sheetNames.length} sheets`,
      },
    ],
    meta: {
      sheets: workbook.sheetNames,
      totalRows: workbook.totalRows,
      detectedFormat: "generic",
    },
    rawPreview: workbook.sheets[workbook.sheetNames[0]]?.slice(0, 5),
  };
}

export const genericAnalyzer: AnalyzerDefinition = {
  id: "generic",
  icon: "table",
  available: true,
  analyze: analyzeGeneric,
};
