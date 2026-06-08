"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { DocumentChecklistResult } from "@/lib/cases/document-checklist";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

type CaseChecklistProps = {
  checklist: DocumentChecklistResult;
  onUploadForMonth?: (month: number) => void;
};

export function CaseChecklist({ checklist, onUploadForMonth }: CaseChecklistProps) {
  const { t, isRtl } = useLanguage();
  const requiredItems = checklist.items.filter((i) => i.required);
  const paySlipItems = checklist.items.filter((i) => i.kind === "pay-slip-month");

  return (
    <Card data-testid="case-checklist">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-heading">{t.cases.documentChecklist}</h3>
          <div className="flex items-center gap-3">
            <div className="h-2 w-32 overflow-hidden rounded-full bg-[var(--surface-hover)]">
              <div
                className="h-full rounded-full bg-[var(--brand)] transition-all"
                style={{ width: `${checklist.completionPercent}%` }}
                data-testid="checklist-progress"
              />
            </div>
            <span className="text-sm font-semibold text-heading">
              {checklist.completionPercent}%
            </span>
          </div>
        </div>
        <p className="text-sm text-muted">
          {t.cases.checklistRequired}: {checklist.requiredFulfilled}/{checklist.requiredTotal}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <ul className="space-y-2">
          {requiredItems.map((item) => (
            <ChecklistRow key={item.id} item={item} isRtl={isRtl} />
          ))}
        </ul>

        {paySlipItems.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              {t.cases.paySlipMonths}
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {paySlipItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  title={item.fileName ?? (isRtl ? item.labelHe : item.labelEn)}
                  onClick={() => item.month && !item.fulfilled && onUploadForMonth?.(item.month)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border p-2 text-center text-xs transition-colors",
                    item.fulfilled
                      ? "border-[var(--success)]/40 bg-[var(--success)]/5"
                      : "border-[var(--border)] hover:border-[var(--brand)] hover:bg-[var(--brand-light)]",
                  )}
                  data-testid={`checklist-month-${item.month}`}
                >
                  {item.fulfilled ? (
                    <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted" />
                  )}
                  <span className="font-semibold">{item.month}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ChecklistRow({
  item,
  isRtl,
}: {
  item: DocumentChecklistResult["items"][0];
  isRtl: boolean;
}) {
  return (
    <li
      className="flex items-center gap-2 text-sm"
      data-testid={`checklist-item-${item.id}`}
    >
      {item.fulfilled ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--success)]" />
      ) : (
        <Circle className="h-4 w-4 shrink-0 text-muted" />
      )}
      <span className={cn("flex-1", !item.fulfilled && "text-muted")}>
        {isRtl ? item.labelHe : item.labelEn}
      </span>
      {item.fileName && (
        <span className="max-w-[140px] truncate text-xs text-muted">{item.fileName}</span>
      )}
    </li>
  );
}
