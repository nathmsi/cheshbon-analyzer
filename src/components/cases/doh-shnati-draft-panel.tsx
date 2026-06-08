"use client";

import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { DohShnatiDraft } from "@/lib/cases/doh-shnati-draft";
import { openDohShnatiPrintWindow } from "@/lib/cases/export-doh-shnati";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

type DohShnatiDraftPanelProps = {
  draft: DohShnatiDraft;
};

const statusIcon = {
  ok: CheckCircle2,
  warning: AlertTriangle,
  error: AlertTriangle,
  info: Info,
};

const statusClass = {
  ok: "text-[var(--success)]",
  warning: "text-[var(--warning)]",
  error: "text-[var(--danger)]",
  info: "text-[var(--brand)]",
};

export function DohShnatiDraftPanel({ draft }: DohShnatiDraftPanelProps) {
  const { t, locale, isRtl } = useLanguage();

  return (
    <Card data-testid="doh-shnati-draft">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-heading">{t.cases.dohShnatiDraft}</h3>
            <p className="mt-1 text-sm text-muted">{t.cases.dohShnatiSubtitle}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openDohShnatiPrintWindow(draft, locale)}
            data-testid="export-doh-shnati-pdf"
          >
            {t.cases.exportDohShnati}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        {draft.draftRows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-start text-muted">
                  <th className="py-2 pe-4 font-semibold">{t.cases.field}</th>
                  <th className="py-2 pe-4 font-semibold">{t.cases.value}</th>
                  <th className="py-2 font-semibold">{t.cases.source}</th>
                </tr>
              </thead>
              <tbody>
                {draft.draftRows.map((row) => (
                  <tr
                    key={row.labelEn}
                    className="border-b border-[var(--border)]/60"
                    data-testid={`draft-row-${row.source}`}
                  >
                    <td className="py-2.5 pe-4 text-heading">
                      {isRtl ? row.labelHe : row.labelEn}
                    </td>
                    <td className="amount py-2.5 pe-4 font-bold text-heading">{row.value}</td>
                    <td className="py-2.5 text-xs text-muted">{row.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {draft.crossChecks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-heading">{t.cases.crossChecks}</h4>
            {draft.crossChecks.map((check) => {
              const Icon = statusIcon[check.status];
              return (
                <div
                  key={check.id}
                  className={cn(
                    "flex items-start gap-2 rounded-lg border border-[var(--border)] p-3 text-sm",
                  )}
                  data-testid={`cross-check-${check.id}`}
                >
                  <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", statusClass[check.status])} />
                  <span>{isRtl ? check.messageHe : check.messageEn}</span>
                </div>
              );
            })}
          </div>
        )}

        {draft.readyForDraft && (
          <p className="rounded-lg bg-[var(--success)]/10 p-3 text-sm font-semibold text-[var(--success)]">
            {t.cases.dohShnatiReady}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
