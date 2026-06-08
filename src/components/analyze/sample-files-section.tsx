"use client";

import { Download, FileSpreadsheet } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { Card, CardContent } from "@/components/ui/card";

const samples = [
  {
    file: "/samples/sample-pay-slip.xlsx",
    analyzer: "pay-slip" as const,
    nameHe: "תלוש שכר לדוגמה",
    nameEn: "Sample Pay Slip",
  },
  {
    file: "/samples/sample-form-106.xlsx",
    analyzer: "form-106" as const,
    nameHe: "טופס 106 לדוגמה",
    nameEn: "Sample Form 106",
  },
];

export function SampleFilesSection() {
  const { locale, isRtl } = useLanguage();

  return (
    <section data-testid="sample-files">
      <div className="mb-5">
        <p className="section-label mb-1">{isRtl ? "בדיקה" : "Testing"}</p>
        <h2 className="text-2xl font-bold text-slate-900">
          {isRtl ? "קבצים לדוגמה" : "Sample Files"}
        </h2>
        <p className="mt-1 text-[15px] text-slate-500">
          {isRtl
            ? "הורד קובץ לדוגמה כדי לבדוק את הניתוח"
            : "Download a sample file to test the analysis"}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {samples.map((sample) => (
          <Card key={sample.file} className="hover:border-teal-200 hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-blue-50 text-teal-600">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">
                  {locale === "he" ? sample.nameHe : sample.nameEn}
                </p>
                <p className="text-xs text-slate-400">.xlsx</p>
              </div>
              <a
                href={sample.file}
                download
                data-testid={`sample-download-${sample.analyzer}`}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
              >
                <Download className="h-4 w-4" />
                {isRtl ? "הורד" : "Download"}
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
