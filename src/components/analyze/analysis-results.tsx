"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Copy,
  Check,
  TrendingUp,
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

function confidenceBadge(
  confidence: "high" | "medium" | "low",
  t: ReturnType<typeof useLanguage>["t"],
) {
  const map = {
    high: { variant: "success" as const, label: t.results.high },
    medium: { variant: "warning" as const, label: t.results.medium },
    low: { variant: "muted" as const, label: t.results.low },
  };
  return map[confidence];
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const { t, locale } = useLanguage();
  const [copied, setCopied] = useState(false);

  const conf = confidenceBadge(result.confidence, t);

  const copySummary = async () => {
    const lines = [
      result.summary.title,
      "",
      ...result.summary.kpis.map((k) => `${k.label}: ${k.value}`),
      "",
      ...result.sections.flatMap((section) => [
        section.title,
        ...section.fields.map(
          (f) =>
            `${f.label}: ${formatFieldValue(f.value, f.type, locale)}`,
        ),
        "",
      ]),
      ...result.insights.map((i) => i.message),
    ];

    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-in space-y-6" data-testid="analysis-results">
      {/* Summary header */}
      <div className="panel flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[var(--brand)]" />
            <p className="section-label">{t.results.summary}</p>
          </div>
          <h2
            className="text-2xl font-bold text-heading sm:text-3xl"
            data-testid="result-title"
          >
            {result.summary.title}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant={conf.variant} data-testid="confidence-badge">
              {t.results.confidence}: {conf.label}
            </Badge>
            <Badge variant="muted">
              {result.meta.sheets.length} {t.results.sheets}
            </Badge>
            <Badge variant="muted">
              {formatNumber(result.meta.totalRows, locale)} {t.results.rows}
            </Badge>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={copySummary}
          data-testid="copy-summary-btn"
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
      </div>

      {/* KPI cards */}
      {result.summary.kpis.length > 0 && (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          data-testid="kpi-grid"
        >
          {result.summary.kpis.map((kpi) => (
            <Card
              key={kpi.label}
              className={cn(kpi.highlight && "kpi-highlight")}
              data-testid={`kpi-${kpi.label}`}
            >
              <CardContent className="p-5">
                <p className="text-sm font-medium text-muted">{kpi.label}</p>
                <p
                  className={cn(
                    "mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl",
                    kpi.highlight ? "text-[var(--brand)]" : "text-heading",
                  )}
                  data-testid="kpi-value"
                >
                  {kpi.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Insights */}
      {result.insights.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-heading">{t.results.insights}</h3>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {result.insights.map((insight, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-3 rounded-xl p-4",
                  insight.type === "success" && "insight-success",
                  insight.type === "warning" && "insight-warning",
                  insight.type === "info" && "insight-info",
                )}
                data-testid={`insight-${i}`}
              >
                {insight.type === "success" && (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                )}
                {insight.type === "warning" && (
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                )}
                {insight.type === "info" && (
                  <Info className="mt-0.5 h-5 w-5 shrink-0" />
                )}
                <p className="text-[15px] leading-relaxed">{insight.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Detail sections */}
      <div className="grid gap-5 lg:grid-cols-2">
        {result.sections.map((section) => (
        <Card key={section.id} data-testid={`section-${section.id}`}>
          <CardHeader>
            <h3 className="text-base font-bold text-heading">{section.title}</h3>
          </CardHeader>
          <CardContent className="pt-2">
            {section.fields.map((field) => (
              <div key={field.key} className="field-row" data-testid={`field-${field.key}`}>
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-sm font-medium text-muted">{field.label}</span>
                    {field.confidence !== "high" && (
                      <Badge variant="muted" className="shrink-0 text-[10px]">
                        {field.confidence === "medium"
                          ? t.results.medium
                          : t.results.low}
                      </Badge>
                    )}
                  </div>
                  <span className="text-end text-base font-bold text-heading">
                    {formatFieldValue(field.value, field.type, locale)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Raw preview */}
      {result.rawPreview && result.rawPreview.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="font-bold text-slate-900">{t.results.rawData}</h3>
          </CardHeader>
          <CardContent className="overflow-x-auto pt-0">
            <table className="w-full text-sm">
              <tbody>
                {result.rawPreview.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2.5 text-slate-700">
                        {cell || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
