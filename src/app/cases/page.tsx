"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, FolderOpen, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type CaseRow = {
  id: string;
  clientName: string;
  clientIdNum: string | null;
  taxYear: number;
  status: string;
  documentCount: number;
  analyzedCount: number;
  updatedAt: string;
};

const statusVariant: Record<string, "default" | "success" | "warning" | "muted"> = {
  DRAFT: "muted",
  IN_PROGRESS: "warning",
  READY: "success",
  FILED: "default",
};

export default function CasesPage() {
  const { t, isRtl } = useLanguage();
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/cases");
      if (!res.ok) throw new Error(await res.text());
      setCases(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/cases");
        if (cancelled) return;
        if (!res.ok) throw new Error(await res.text());
        setCases(await res.json());
        setError(null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="animate-in space-y-6" data-testid="cases-page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="section-label mb-1">{t.cases.label}</p>
          <h1 className="text-2xl font-bold text-heading sm:text-3xl">{t.cases.title}</h1>
          <p className="mt-1 text-sm text-muted">{t.cases.subtitle}</p>
        </div>
        <Link href="/cases/new">
          <Button data-testid="new-case-btn">
            <Plus className="h-4 w-4" />
            {t.cases.newCase}
          </Button>
        </Link>
      </div>

      {loading && (
        <p className="text-muted">{isRtl ? "טוען..." : "Loading..."}</p>
      )}

      {error && (
        <div className="error-panel rounded-xl p-4 text-sm">
          {t.cases.dbError}
        </div>
      )}

      {!loading && cases.length === 0 && !error && (
        <div className="panel flex flex-col items-center gap-4 p-12 text-center">
          <FolderOpen className="h-12 w-12 text-muted" />
          <p className="text-muted">{t.cases.empty}</p>
          <Link href="/cases/new">
            <Button>{t.cases.newCase}</Button>
          </Link>
        </div>
      )}

      <div className="grid gap-3">
        {cases.map((c) => (
          <Link key={c.id} href={`/cases/${c.id}`} data-testid={`case-row-${c.id}`}>
            <div className="tool-card flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-light)] text-[var(--brand)]">
                <FolderOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold text-heading">{c.clientName}</h2>
                  <Badge variant={statusVariant[c.status] ?? "muted"}>
                    {t.cases.status[c.status as keyof typeof t.cases.status] ?? c.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted">
                  {t.cases.taxYear}: {c.taxYear}
                  {c.clientIdNum ? ` · ${t.fields.employeeId} ${c.clientIdNum}` : ""}
                </p>
              </div>
              <div className="hidden shrink-0 text-end sm:block">
                <p className="flex items-center gap-1 text-sm font-semibold text-heading">
                  <FileText className="h-4 w-4 text-muted" />
                  {c.analyzedCount}/{c.documentCount}
                </p>
                <p className="text-xs text-muted">{t.cases.documents}</p>
              </div>
              <Chevron className="h-5 w-5 shrink-0 text-muted" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
