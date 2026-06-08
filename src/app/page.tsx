"use client";

import { Upload, Sparkles, BarChart3, Shield, Zap } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { getAnalyzerMeta } from "@/lib/analyzers/registry";
import { AnalyzerCard } from "@/components/analyze/analyzer-card";
import { SampleFilesSection } from "@/components/analyze/sample-files-section";

export default function HomePage() {
  const { t, isRtl } = useLanguage();
  const analyzers = getAnalyzerMeta();
  const availableCount = analyzers.filter((a) => a.available).length;

  const steps = [
    { icon: Upload, text: t.home.step1, color: "bg-teal-100 text-teal-700" },
    { icon: Sparkles, text: t.home.step2, color: "bg-blue-100 text-blue-700" },
    { icon: BarChart3, text: t.home.step3, color: "bg-violet-100 text-violet-700" },
  ];

  return (
    <div className="space-y-16 animate-in">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl hero-gradient px-6 py-12 text-white shadow-xl shadow-teal-900/20 sm:px-10 sm:py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
        <div className="relative mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <Zap className="h-4 w-4 text-amber-300" />
            {isRtl ? "ניתוח תוך שניות" : "Analysis in seconds"}
          </div>
          <h1
            className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-tight"
            data-testid="hero-title"
          >
            {t.home.welcome}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-teal-50/90 sm:text-xl">
            {t.appDescription}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Shield className="h-4 w-4" />
              {isRtl ? "עיבוד מקומי בדפדפן" : "Local browser processing"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              <BarChart3 className="h-4 w-4" />
              {availableCount} {isRtl ? "ניתוחים פעילים" : "active analyzers"}
            </span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section>
        <p className="section-label mb-2 text-center">{t.home.howItWorks}</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-1 items-center gap-3 sm:flex-col sm:text-center">
              <div className="card-elevated flex flex-1 flex-col items-center gap-4 p-6 sm:w-full">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${step.color}`}
                >
                  <step.icon className="h-7 w-7" />
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  {i + 1}
                </div>
                <p className="text-[15px] font-semibold leading-snug text-heading">
                  {step.text}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden h-0.5 flex-1 step-connector sm:block" aria-hidden />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Analyzers grid */}
      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="section-label mb-1">{isRtl ? "כלים" : "Tools"}</p>
            <h2 className="text-2xl font-bold text-heading">
              {t.home.availableAnalyzers}
            </h2>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2" data-testid="analyzers-grid">
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
