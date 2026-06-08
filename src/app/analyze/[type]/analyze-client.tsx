"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, FileSearch } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { getAnalyzer } from "@/lib/analyzers/registry";
import { parseFile } from "@/lib/analyzers/excel-parser";
import type { AnalysisResult, AnalyzerId } from "@/lib/analyzers/types";
import { FileUploadZone } from "@/components/analyze/file-upload-zone";
import { AnalysisResults } from "@/components/analyze/analysis-results";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AnalyzePageClient({ type }: { type: string }) {
  const analyzerId = type as AnalyzerId;
  const { t, locale, isRtl } = useLanguage();
  const analyzer = getAnalyzer(analyzerId);

  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  const handleAnalyze = useCallback(
    async (selectedFile: File) => {
      if (!analyzer) return;

      setFile(selectedFile);
      setIsAnalyzing(true);
      setError(null);
      setResult(null);

      try {
        const workbook = await parseFile(selectedFile);
        const analysis = analyzer.analyze(workbook, locale);
        analysis.fileName = selectedFile.name;
        setResult(analysis);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsAnalyzing(false);
      }
    },
    [analyzer, locale],
  );

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  if (!analyzer) {
    return (
      <div className="text-center">
        <p className="text-muted">Analyzer not found</p>
        <Link
          href="/"
          className="mt-4 inline-block text-[var(--brand)] hover:underline"
        >
          {t.analyze.backToHome}
        </Link>
      </div>
    );
  }

  const analyzerInfo = t.analyzers[analyzerId];

  return (
    <div className="animate-in space-y-8" data-testid={`analyze-page-${analyzerId}`}>
      <div className="panel p-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-[var(--brand)]"
          data-testid="back-home"
        >
          <BackArrow className="h-4 w-4" />
          {t.analyze.backToHome}
        </Link>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-light)] text-[var(--brand)]">
            <FileSearch className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-heading">{analyzerInfo.title}</h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
              {analyzerInfo.description}
            </p>
          </div>
        </div>
      </div>

      {!result && (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <FileUploadZone
              onFileSelect={handleAnalyze}
              isAnalyzing={isAnalyzing}
              selectedFile={file}
              onClear={handleReset}
            />
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="error-panel" data-testid="analysis-error">
          <CardContent className="p-6">
            <p className="font-semibold text-[var(--danger)]">{t.analyze.errorTitle}</p>
            <p className="mt-1 text-sm text-muted">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={handleReset}>
              {t.analyze.tryAgain}
            </Button>
          </CardContent>
        </Card>
      )}

      {result && (
        <>
          <AnalysisResults result={result} />
          <div className="flex justify-center pt-2">
            <Button onClick={handleReset} data-testid="analyze-another-btn">
              {t.analyze.analyzeAnother}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
