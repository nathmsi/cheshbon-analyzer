import type { AnalysisResult } from "@/lib/analyzers/types";

export function extractFieldValue(
  analysis: AnalysisResult,
  keys: string[],
): string | number | null {
  for (const section of analysis.sections) {
    for (const field of section.fields) {
      if (keys.includes(field.key)) {
        return field.value;
      }
    }
  }
  return null;
}

export function extractNumericField(
  analysis: AnalysisResult,
  keys: string[],
): number | null {
  const raw = extractFieldValue(analysis, keys);
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    const num = parseFloat(raw.replace(/,/g, ""));
    return Number.isNaN(num) ? null : num;
  }
  return null;
}

export function extractTextField(analysis: AnalysisResult, keys: string[]): string | null {
  const raw = extractFieldValue(analysis, keys);
  if (raw === null || raw === undefined) return null;
  return String(raw);
}
