"use client";

import { useLanguage } from "@/lib/i18n/language-context";

export function Footer() {
  const { t, isRtl } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="footer-bar mt-auto">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted sm:flex-row sm:px-6">
        <p>
          © {year} {t.appName}
        </p>
        <p className="text-center text-xs sm:text-sm">
          {isRtl
            ? "כלי ניתוח מהיר לרואי חשבון בישראל"
            : "Fast analysis tool for Israeli accountants"}
        </p>
      </div>
    </footer>
  );
}
