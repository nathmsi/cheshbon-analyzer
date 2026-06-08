"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { getAnalyzer } from "@/lib/analyzers/registry";
import { parseFile } from "@/lib/analyzers/excel-parser";
import type { AnalysisResult, AnalyzerId } from "@/lib/analyzers/types";
import { FileUploadZone } from "@/components/analyze/file-upload-zone";
import { AnalysisResults } from "@/components/analyze/analysis-results";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AnalyzePage({
  params,
}: {
  params: { type: string };
}) {
  const { type } = params;
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
        <p className="text-slate-500">Analyzer not found</p>
        <Link href="/" className="mt-4 inline-block text-teal-600 hover:underline">
          {t.analyze.backToHome}
        </Link>
      </div>
    );
  }

  const analyzerInfo = t.analyzers[analyzerId];

  return (
    <div className="space-y-8">
      {/* Back + title */}
      <div>
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          <BackArrow className="h-4 w-4" />
          {t.analyze.backToHome}
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">{analyzerInfo.title}</h1>
        <p className="mt-2 text-slate-500">{analyzerInfo.description}</p>
      </div>

      {/* Upload zone (hidden when results shown) */}
      {!result && (
        <Card>
          <CardContent className="p-6">
            <FileUploadZone
              onFileSelect={handleAnalyze}
              isAnalyzing={isAnalyzing}
              selectedFile={file}
              onClear={handleReset}
            />
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="font-medium text-red-800">{t.analyze.errorTitle}</p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={handleReset}>
              {t.analyze.tryAgain}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <>
          <AnalysisResults result={result} />
          <div className="flex justify-center pt-4">
            <Button onClick={handleReset}>{t.analyze.analyzeAnother}</Button>
          </div>
        </>
      )}
    </div>
  );
}
