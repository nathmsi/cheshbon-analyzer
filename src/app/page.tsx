"use client";

import { Upload, Sparkles, BarChart3 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { getAnalyzerMeta } from "@/lib/analyzers/registry";
import { AnalyzerCard } from "@/components/analyze/analyzer-card";
import { SampleFilesSection } from "@/components/analyze/sample-files-section";

export default function HomePage() {
  const { t } = useLanguage();
  const analyzers = getAnalyzerMeta();

  const steps = [
    { icon: Upload, text: t.home.step1 },
    { icon: Sparkles, text: t.home.step2 },
    { icon: BarChart3, text: t.home.step3 },
  ];

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {t.home.welcome}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-500">
            {t.appDescription}
          </p>
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-slate-400">
          {t.home.howItWorks}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <step.icon className="h-6 w-6" />
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                {i + 1}
              </div>
              <p className="text-sm font-medium text-slate-700">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Analyzers grid */}
      <section>
        <h2 className="mb-6 text-xl font-bold text-slate-900">
          {t.home.availableAnalyzers}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {analyzers.map((analyzer) => (
            <AnalyzerCard
              key={analyzer.id}
              id={analyzer.id}
              icon={analyzer.icon as "receipt" | "file-text" | "users" | "table"}
              available={analyzer.available}
            />
          ))}
        </div>
      </section>

      <SampleFilesSection />
    </div>
  );
}
