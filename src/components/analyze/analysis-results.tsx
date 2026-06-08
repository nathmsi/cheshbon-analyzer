"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Copy,
  Check,
  RotateCcw,
  FileText,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { AnalysisResult } from "@/lib/analyzers/types";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

type AnalysisResultsProps = {
  result: AnalysisResult;
  fileName?: string;
  onReset?: () => void;
};

function formatFieldValue(
  value: string | number,
  type: string,
  locale: "he" | "en",
): string {
  if (typeof value === "number") {
    if (type === "currency") return formatCurrency(value, locale);
    if (type === "percent") return formatPercent(value, locale);
    return formatNumber(value, locale);
  }
  return value;
}

function isAmount(type: string) {
  return type === "currency" || type === "number" || type === "percent";
}

export function AnalysisResults({ result, fileName, onReset }: AnalysisResultsProps) {
  const { t, locale, isRtl } = useLanguage();
  const [copied, setCopied] = useState(false);

  const confMap = {
    high: { variant: "success" as const, label: t.results.high },
    medium: { variant: "warning" as const, label: t.results.medium },
    low: { variant: "muted" as const, label: t.results.low },
  };
  const conf = confMap[result.confidence];

  const copySummary = async () => {
    const lines = [
      result.summary.title,
      fileName ? `${isRtl ? "קובץ" : "File"}: ${fileName}` : "",
      "",
      ...result.summary.kpis.map((k) => `${k.label}: ${k.value}`),
      "",
      ...result.sections.flatMap((section) => [
        `── ${section.title} ──`,
        ...section.fields.map(
          (f) => `${f.label}: ${formatFieldValue(f.value, f.type, locale)}`,
        ),
        "",
      ]),
      ...result.insights.map((i) => `• ${i.message}`),
    ].filter(Boolean);

    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-in space-y-5" data-testid="analysis-results">
      {/* Report header */}
      <div className="report-header">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">
              {t.results.summary}
            </p>
            <h2
              className="mt-1 text-2xl font-bold sm:text-3xl"
              data-testid="result-title"
            >
              {result.summary.title}
            </h2>
            {fileName && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-white/80">
                <FileText className="h-3.5 w-3.5" />
                {fileName}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-md bg-white/15 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
                {t.results.confidence}: {conf.label}
              </span>
              <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-white/80">
                {result.meta.sheets.length} {t.results.sheets}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copySummary}
              data-testid="copy-summary-btn"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  {t.analyze.copied}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  {t.analyze.exportSummary}
                </>
              )}
            </Button>
            {onReset && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                data-testid="analyze-another-btn"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                <RotateCcw className="h-4 w-4" />
                {t.analyze.analyzeAnother}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* KPI strip — key numbers first for accountant */}
      {result.summary.kpis.length > 0 && (
        <div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          data-testid="kpi-grid"
        >
          {result.summary.kpis.map((kpi) => (
            <div
              key={kpi.label}
              className={cn("kpi-card p-4 ps-5", kpi.highlight && "kpi-card-highlight")}
              data-testid={`kpi-${kpi.label}`}
            >
              <p className="text-xs font-bold uppercase tracking-wide text-muted">
                {kpi.label}
              </p>
              <p
                className={cn(
                  "amount mt-1.5 text-2xl font-bold sm:text-[1.75rem]",
                  kpi.highlight ? "text-[var(--brand)]" : "text-heading",
                )}
                data-testid="kpi-value"
              >
                {kpi.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Insights / alerts — accountant needs these prominently */}
      {result.insights.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">
              {t.results.insights}
            </h3>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {result.insights.map((insight, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-3 rounded-lg p-3.5 text-sm",
                  insight.type === "success" && "insight-success",
                  insight.type === "warning" && "insight-warning",
                  insight.type === "info" && "insight-info",
                )}
                data-testid={`insight-${i}`}
              >
                {insight.type === "success" && (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />
                )}
                {insight.type === "warning" && (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" />
                )}
                {insight.type === "info" && (
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
                )}
                <p className="leading-relaxed">{insight.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Detail tables — spreadsheet-like for accountant */}
      <div className="grid gap-4 lg:grid-cols-2">
        {result.sections.map((section) => (
          <Card key={section.id} data-testid={`section-${section.id}`}>
            <CardHeader>
              <h3 className="text-sm font-bold text-heading">{section.title}</h3>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0 pt-0">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{isRtl ? "שדה" : "Field"}</th>
                    <th className="text-end">{isRtl ? "ערך" : "Value"}</th>
                  </tr>
                </thead>
                <tbody>
                  {section.fields.map((field) => (
                    <tr key={field.key} data-testid={`field-${field.key}`}>
                      <td className="text-muted">
                        <span className="font-medium">{field.label}</span>
                        {field.confidence !== "high" && (
                          <Badge variant="muted" className="ms-2 text-[10px]">
                            {field.confidence === "medium"
                              ? t.results.medium
                              : t.results.low}
                          </Badge>
                        )}
                      </td>
                      <td
                        className={cn(
                          "text-end font-semibold text-heading",
                          isAmount(field.type) && "amount text-base",
                        )}
                      >
                        {formatFieldValue(field.value, field.type, locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
