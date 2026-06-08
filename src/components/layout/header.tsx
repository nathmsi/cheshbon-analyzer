"use client";

import Link from "next/link";
import { Calculator, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const { t } = useLanguage();

  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3" data-testid="home-link">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-md shadow-teal-600/20">
            <Calculator className="h-5 w-5" />
            <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-amber-300 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <div>
            <p className="text-[15px] font-bold tracking-tight text-heading">
              {t.appName}
            </p>
            <p className="text-[11px] font-medium text-muted">{t.appTagline}</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
