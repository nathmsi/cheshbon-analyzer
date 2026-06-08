"use client";

import Link from "next/link";
import { Calculator } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { LanguageSwitcher } from "./language-switcher";

export function Header() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900">{t.appName}</p>
            <p className="text-xs text-slate-500">{t.appTagline}</p>
          </div>
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
