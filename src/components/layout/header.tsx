"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { AuthButton } from "@/components/auth/auth-button";
import { cn } from "@/lib/utils/cn";

const quickLinks = [
  { href: "/cases", labelHe: "תיקים", labelEn: "Cases", match: "cases" },
  { href: "/analyze/pay-slip", labelHe: "תלוש שכר", labelEn: "Pay Slip", match: "pay-slip" },
  { href: "/analyze/form-106", labelHe: "טופס 106", labelEn: "Form 106", match: "form-106" },
  { href: "/analyze/generic", labelHe: "ניתוח כללי", labelEn: "Generic", match: "generic" },
] as const;

export function Header() {
  const { t, locale, isRtl } = useLanguage();
  const pathname = usePathname();

  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="app-main mx-auto flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" data-testid="home-link">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand)] text-white shadow-sm">
            <Calculator className="h-4 w-4" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold leading-tight text-heading">{t.appName}</p>
            <p className="text-[10px] font-medium text-muted">{t.appTagline}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label={t.nav.analyzers}>
          {quickLinks.map((link) => {
            const active = pathname.includes(link.match);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn("nav-pill", active && "nav-pill-active")}
              >
                {isRtl ? link.labelHe : link.labelEn}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <AuthButton />
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
