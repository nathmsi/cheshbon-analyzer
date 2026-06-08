"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils/cn";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
      <Languages className="mx-1 h-4 w-4 text-slate-400" />
      <button
        onClick={() => setLocale("he")}
        className={cn(
          "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          locale === "he"
            ? "bg-teal-600 text-white"
            : "text-slate-600 hover:bg-slate-50",
        )}
      >
        עברית
      </button>
      <button
        onClick={() => setLocale("en")}
        className={cn(
          "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          locale === "en"
            ? "bg-teal-600 text-white"
            : "text-slate-600 hover:bg-slate-50",
        )}
      >
        EN
      </button>
    </div>
  );
}
