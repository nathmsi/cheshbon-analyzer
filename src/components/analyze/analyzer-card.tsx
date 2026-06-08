"use client";

import Link from "next/link";
import {
  Receipt,
  FileText,
  Table,
  Users,
  ArrowLeft,
  ArrowRight,
  Lock,
  Clock,
  Landmark,
  Shield,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { AnalyzerId } from "@/lib/analyzers/types";
import { cn } from "@/lib/utils/cn";

const iconMap = {
  receipt: Receipt,
  "file-text": FileText,
  users: Users,
  table: Table,
  landmark: Landmark,
  shield: Shield,
} as const;

const primaryTools: AnalyzerId[] = ["pay-slip", "form-106"];

type AnalyzerCardProps = {
  id: AnalyzerId;
  icon: keyof typeof iconMap;
  available: boolean;
  primary?: boolean;
};

export function AnalyzerCard({ id, icon, available, primary }: AnalyzerCardProps) {
  const { t, isRtl } = useLanguage();
  const Icon = iconMap[icon];
  const info = t.analyzers[id];
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const content = (
    <div
      className={cn(
        "tool-card group flex h-full flex-col p-5 sm:p-6",
        primary && available && "tool-card-primary",
        !available && "opacity-60",
      )}
      data-testid={`analyzer-card-${id}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            available
              ? "bg-[var(--brand)] text-white"
              : "bg-[var(--surface-hover)] text-muted",
          )}
        >
          {available ? <Icon className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
        </div>
        {!available && (
          <span className="inline-flex items-center gap-1 rounded-md bg-[var(--surface-hover)] px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-muted">
            <Clock className="h-3 w-3" />
            {t.home.comingSoon}
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold text-heading">{info.title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">
        {info.description}
      </p>

      {available ? (
        <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4">
          <span className="text-sm font-bold text-[var(--brand)]">
            {isRtl ? "פתח ניתוח" : "Open analysis"}
          </span>
          <Arrow className="h-4 w-4 text-[var(--brand)] transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        </div>
      ) : null}
    </div>
  );

  if (available) {
    return (
      <Link href={`/analyze/${id}`} data-testid={`analyzer-link-${id}`}>
        {content}
      </Link>
    );
  }

  return content;
}
