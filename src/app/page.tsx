"use client";

import { Shield, FileSpreadsheet, Zap, FolderOpen } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";
import { getAnalyzerMeta } from "@/lib/analyzers/registry";
import { AnalyzerCard } from "@/components/analyze/analyzer-card";
import { SampleFilesSection } from "@/components/analyze/sample-files-section";
import type { AnalyzerId } from "@/lib/analyzers/types";

const primaryIds: AnalyzerId[] = ["pay-slip", "form-106"];

export default function HomePage() {
  const { t, isRtl } = useLanguage();
  const analyzers = getAnalyzerMeta();
  const primary = analyzers.filter((a) => primaryIds.includes(a.id));
  const secondary = analyzers.filter((a) => !primaryIds.includes(a.id));

  return (
    <div className="animate-in space-y-8">
      {/* Workspace header */}
      <section className="panel p-6 sm:p-8">
        <p className="section-label mb-2">
          {isRtl ? "משרד רואה חשבון" : "Accountant workspace"}
        </p>
        <h1
          className="text-2xl font-bold text-heading sm:text-3xl"
          data-testid="hero-title"
        >
          {t.home.welcome}
        </h1>
        <p className="mt-2 max-w-2xl text-base text-muted">{t.home.subtitle}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="stat-chip">
            <Shield className="h-3.5 w-3.5 text-[var(--brand)]" />
            {isRtl ? "עיבוד מקומי — ללא העלאה לשרת" : "Local processing — no server upload"}
          </span>
          <span className="stat-chip">
            <FileSpreadsheet className="h-3.5 w-3.5 text-[var(--brand)]" />
            Excel · CSV · PDF
          </span>
          <span className="stat-chip">
            <Zap className="h-3.5 w-3.5 text-[var(--accent)]" />
            {isRtl ? "תוצאות מיידיות" : "Instant results"}
          </span>
        </div>
      </section>

      {/* Client cases */}
      <section className="panel flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="section-label mb-1">{t.cases.label}</p>
          <h2 className="text-xl font-bold text-heading">{t.cases.title}</h2>
          <p className="mt-1 text-sm text-muted">{t.cases.subtitle}</p>
        </div>
        <Link
          href="/cases"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
          data-testid="cases-cta"
        >
          <FolderOpen className="h-4 w-4" />
          {t.nav.cases}
        </Link>
      </section>

      {/* Primary tools — most used by accountants */}
      <section>
        <div className="mb-4">
          <p className="section-label mb-1">{isRtl ? "שימוש יומיומי" : "Daily use"}</p>
          <h2 className="text-xl font-bold text-heading">{t.home.primaryTools}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2" data-testid="analyzers-grid">
          {primary.map((analyzer) => (
            <AnalyzerCard
              key={analyzer.id}
              id={analyzer.id}
              icon={analyzer.icon as "receipt" | "file-text" | "users" | "table" | "landmark" | "shield"}
              available={analyzer.available}
              primary
            />
          ))}
        </div>
      </section>

      {/* Secondary tools */}
      {secondary.length > 0 && (
        <section>
          <div className="mb-4">
            <p className="section-label mb-1">{isRtl ? "כלים נוספים" : "More tools"}</p>
            <h2 className="text-lg font-bold text-heading">{t.home.availableAnalyzers}</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {secondary.map((analyzer) => (
              <AnalyzerCard
                key={analyzer.id}
                id={analyzer.id}
                icon={analyzer.icon as "receipt" | "file-text" | "users" | "table" | "landmark" | "shield"}
                available={analyzer.available}
              />
            ))}
          </div>
        </section>
      )}

      <SampleFilesSection />
    </div>
  );
}
