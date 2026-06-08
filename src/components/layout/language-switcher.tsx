"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils/cn";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-sm"
      data-testid="language-switcher"
    >
      <Languages className="mx-1 h-4 w-4 text-[var(--muted)]" aria-hidden />
      <button
        onClick={() => setLocale("he")}
        data-testid="lang-he"
        aria-pressed={locale === "he"}
        className={cn(
          "rounded-lg px-3 py-1.5 text-sm font-semibold transition-all",
          locale === "he"
            ? "bg-teal-600 text-white shadow-sm dark:bg-teal-500"
            : "text-[var(--muted)] hover:bg-[var(--surface-hover)]",
        )}
      >
        עברית
      </button>
      <button
        onClick={() => setLocale("en")}
        data-testid="lang-en"
        aria-pressed={locale === "en"}
        className={cn(
          "rounded-lg px-3 py-1.5 text-sm font-semibold transition-all",
          locale === "en"
            ? "bg-teal-600 text-white shadow-sm dark:bg-teal-500"
            : "text-[var(--muted)] hover:bg-[var(--surface-hover)]",
        )}
      >
        EN
      </button>
    </div>
  );
}
