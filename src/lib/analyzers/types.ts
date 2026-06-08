import type { Locale } from "@/lib/i18n/translations";

export type AnalyzerId = "pay-slip" | "form-106" | "client-status" | "generic";

export type FieldValue = {
  key: string;
  label: string;
  value: string | number;
  type: "text" | "currency" | "number" | "percent" | "date";
  confidence: "high" | "medium" | "low";
  source?: string;
};

export type Insight = {
  type: "info" | "warning" | "success";
  message: string;
};

export type AnalysisResult = {
  analyzerId: AnalyzerId;
  fileName: string;
  analyzedAt: string;
  confidence: "high" | "medium" | "low";
  summary: {
    title: string;
    kpis: Array<{
      label: string;
      value: string;
      highlight?: boolean;
    }>;
  };
  sections: Array<{
    id: string;
    title: string;
    fields: FieldValue[];
  }>;
  insights: Insight[];
  meta: {
    sheets: string[];
    totalRows: number;
    detectedFormat?: string;
  };
  rawPreview?: string[][];
};

export type ParsedWorkbook = {
  sheets: Record<string, string[][]>;
  sheetNames: string[];
  totalRows: number;
};

export type AnalyzerDefinition = {
  id: AnalyzerId;
  icon: string;
  available: boolean;
  analyze: (workbook: ParsedWorkbook, locale: Locale) => AnalysisResult;
};

export type AnalyzerMeta = {
  id: AnalyzerId;
  icon: string;
  available: boolean;
};
