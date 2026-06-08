import type { AnalysisResult } from "@/lib/analyzers/types";
import { extractFieldValue } from "./extract-fields";

const HEBREW_MONTHS: Record<string, number> = {
  ינואר: 1,
  פברואר: 2,
  מרץ: 3,
  מארס: 3,
  אפריל: 4,
  מאי: 5,
  יוני: 6,
  יולי: 7,
  אוגוסט: 8,
  ספטמבר: 9,
  אוקטובר: 10,
  נובמבר: 11,
  דצמבר: 12,
};

const ENGLISH_MONTHS: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

function monthFromString(value: string): number | null {
  const trimmed = value.trim();

  const mmYyyy = trimmed.match(/^(0?[1-9]|1[0-2])[/.-](20\d{2})$/);
  if (mmYyyy) return parseInt(mmYyyy[1], 10);

  const yyyyMm = trimmed.match(/^(20\d{2})[/.-](0?[1-9]|1[0-2])$/);
  if (yyyyMm) return parseInt(yyyyMm[2], 10);

  const monthOnly = trimmed.match(/^(0?[1-9]|1[0-2])$/);
  if (monthOnly) return parseInt(monthOnly[1], 10);

  const lower = trimmed.toLowerCase();
  for (const [name, num] of Object.entries(ENGLISH_MONTHS)) {
    if (lower.includes(name)) return num;
  }
  for (const [name, num] of Object.entries(HEBREW_MONTHS)) {
    if (trimmed.includes(name)) return num;
  }

  return null;
}

export function detectPaySlipMonth(
  fileName: string,
  analysis?: AnalysisResult | null,
): number | null {
  const fromFile = monthFromString(fileName);
  if (fromFile) return fromFile;

  const filePatterns = [
    /(?:^|[^0-9])(0?[1-9]|1[0-2])(?:[^0-9]|$)/,
    /(20\d{2})[_.-](0?[1-9]|1[0-2])/,
    /(0?[1-9]|1[0-2])[_.-](20\d{2})/,
  ];
  for (const pattern of filePatterns) {
    const match = fileName.match(pattern);
    if (match) {
      const candidate = match[1].length === 4 ? match[2] : match[1];
      const month = parseInt(candidate, 10);
      if (month >= 1 && month <= 12) return month;
    }
  }

  if (analysis) {
    const monthField = extractFieldValue(analysis, ["month", "period"]);
    if (monthField !== null) {
      const fromAnalysis = monthFromString(String(monthField));
      if (fromAnalysis) return fromAnalysis;
    }
  }

  return null;
}
