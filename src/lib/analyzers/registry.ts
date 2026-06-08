import { clientStatusAnalyzer } from "./client-status";
import { form106Analyzer } from "./form-106";
import { genericAnalyzer } from "./generic";
import { paySlipAnalyzer } from "./pay-slip";
import type { AnalyzerDefinition, AnalyzerId, AnalyzerMeta } from "./types";

export const analyzers: AnalyzerDefinition[] = [
  paySlipAnalyzer,
  form106Analyzer,
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
