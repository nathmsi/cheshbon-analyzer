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
    <section>
      <h2 className="mb-4 text-xl font-bold text-slate-900">
        {isRtl ? "קבצים לדוגמה" : "Sample Files"}
      </h2>
      <p className="mb-4 text-sm text-slate-500">
        {isRtl
          ? "הורד קובץ לדוגמה כדי לבדוק את הניתוח"
          : "Download a sample file to test the analysis"}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {samples.map((sample) => (
          <Card key={sample.file} className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">
                  {locale === "he" ? sample.nameHe : sample.nameEn}
                </p>
                <p className="text-xs text-slate-400">.xlsx</p>
              </div>
              <a
                href={sample.file}
                download
                className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-teal-50 hover:text-teal-700"
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
