import { clientStatusAnalyzer } from "./client-status";
import { form106Analyzer } from "./form-106";
import { genericAnalyzer } from "./generic";
import { paySlipAnalyzer } from "./pay-slip";
import { advanceTaxAnalyzer } from "./advance-tax";
import { nationalInsuranceAnalyzer } from "./national-insurance";
import type { AnalyzerDefinition, AnalyzerId, AnalyzerMeta } from "./types";

export const analyzers: AnalyzerDefinition[] = [
  paySlipAnalyzer,
  form106Analyzer,
  advanceTaxAnalyzer,
  nationalInsuranceAnalyzer,
  clientStatusAnalyzer,
  genericAnalyzer,
];

export function getAnalyzer(id: AnalyzerId): AnalyzerDefinition | undefined {
  return analyzers.find((a) => a.id === id);
}

export function getAnalyzerMeta(): AnalyzerMeta[] {
  return analyzers.map(({ id, icon, available }) => ({ id, icon, available }));
}

export function getAvailableAnalyzers(): AnalyzerDefinition[] {
  return analyzers.filter((a) => a.available);
}

/** Document types recommended per tax case (תיק) */
export const caseDocumentTypes: Array<{
  analyzerId: AnalyzerId;
  required: boolean;
}> = [
  { analyzerId: "form-106", required: true },
  { analyzerId: "pay-slip", required: false },
  { analyzerId: "advance-tax", required: false },
  { analyzerId: "national-insurance", required: false },
  { analyzerId: "bank-report", required: false },
];
