"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils/cn";

type BreadcrumbsProps = {
  items: Array<{ label: string; href?: string }>;
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const { isRtl } = useLanguage();
  const Sep = isRtl ? ChevronLeft : ChevronRight;

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-sm">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <Sep className="h-3.5 w-3.5 text-muted" />}
          {item.href ? (
            <Link
              href={item.href}
              className="font-medium text-muted transition-colors hover:text-[var(--brand)]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-heading">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

type AnalyzeSidebarProps = {
  tips: string[];
};

export function AnalyzeSidebar({ tips }: AnalyzeSidebarProps) {
  const { isRtl } = useLanguage();

  return (
    <aside className="sidebar-panel p-5">
      <p className="section-label mb-3">
        {isRtl ? "לפני שמתחילים" : "Before you start"}
      </p>
      <ul className="space-y-3">
        {tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-muted">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
