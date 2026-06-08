"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";
import { getAnalyzer } from "@/lib/analyzers/registry";
import { parseFile } from "@/lib/analyzers/excel-parser";
import type { AnalysisResult, AnalyzerId } from "@/lib/analyzers/types";
import { FileUploadZone } from "@/components/analyze/file-upload-zone";
import { AnalysisResults } from "@/components/analyze/analysis-results";
import { Breadcrumbs, AnalyzeSidebar } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const tipsHe: Record<string, string[]> = {
  "pay-slip": [
    "העלה תלוש שכר בפורמט Excel, CSV או PDF",
    "המערכת תזהה אוטומטית: ברוטו, נטו, מסים וניכויים",
    "לחץ «העתק סיכום» לשליחה ללקוח או לתיק",
  ],
  "form-106": [
    "העלה טופס 106 בפורמט Excel, CSV או PDF",
    "יזוהו הכנסות שנתיות, מס שנוכה ונקודות זיכוי",
    "בדוק שיעור מס אפקטивי והפרשות פנסיה",
  ],
  generic: [
    "מתאים לכל קובץ Excel או PDF לא מובנה",
    "המערכת תזהה עמודות ותחלץ נתונים",
  ],
  "client-status": ["העלה קובץ Excel עם נתוני לקוח"],
};

const tipsEn: Record<string, string[]> = {
  "pay-slip": [
    "Upload a pay slip as Excel, CSV or PDF",
    "Auto-detects: gross, net, taxes and deductions",
    "Click «Copy summary» to send to client or file",
  ],
  "form-106": [
    "Upload Form 106 as Excel, CSV or PDF",
    "Detects annual income, tax withheld and credit points",
    "Check effective tax rate and pension contributions",
  ],
  generic: [
    "Works with any unstructured Excel or PDF file",
    "System detects columns and extracts data",
  ],
  "client-status": ["Upload an Excel file with client data"],
};

export function AnalyzePageClient({ type }: { type: string }) {
  const analyzerId = type as AnalyzerId;
  const { t, locale, isRtl } = useLanguage();
  const analyzer = getAnalyzer(analyzerId);

  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tips = (isRtl ? tipsHe : tipsEn)[analyzerId] ?? [];

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
        <Link href="/" className="mt-4 inline-block text-[var(--brand)] hover:underline">
          {t.analyze.backToHome}
        </Link>
      </div>
    );
  }

  const analyzerInfo = t.analyzers[analyzerId];

  if (result) {
    return (
      <div className="animate-in space-y-5" data-testid={`analyze-page-${analyzerId}`}>
        <Breadcrumbs
          items={[
            { label: t.nav.home, href: "/" },
            { label: analyzerInfo.title },
          ]}
        />
        <AnalysisResults result={result} onReset={handleReset} fileName={file?.name} />
      </div>
    );
  }

  return (
    <div className="animate-in space-y-6" data-testid={`analyze-page-${analyzerId}`}>
      <div>
        <Breadcrumbs
          items={[
            { label: t.nav.home, href: "/" },
            { label: analyzerInfo.title },
          ]}
        />
        <h1 className="text-2xl font-bold text-heading sm:text-3xl">
          {analyzerInfo.title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">{analyzerInfo.description}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
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

        {tips.length > 0 && <AnalyzeSidebar tips={tips} />}
      </div>

      {error && (
        <Card className="error-panel" data-testid="analysis-error">
          <CardContent className="p-5">
            <p className="font-semibold text-[var(--danger)]">{t.analyze.errorTitle}</p>
            <p className="mt-1 text-sm text-muted">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={handleReset}>
              {t.analyze.tryAgain}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
