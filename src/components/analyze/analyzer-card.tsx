"use client";

import Link from "next/link";
import {
  FileText,
  Receipt,
  Table,
  Users,
  ArrowLeft,
  ArrowRight,
  Lock,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { AnalyzerId } from "@/lib/analyzers/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

const iconMap = {
  receipt: Receipt,
  "file-text": FileText,
  users: Users,
  table: Table,
} as const;

type AnalyzerCardProps = {
  id: AnalyzerId;
  icon: keyof typeof iconMap;
  available: boolean;
};

export function AnalyzerCard({ id, icon, available }: AnalyzerCardProps) {
  const { t, isRtl } = useLanguage();
  const Icon = iconMap[icon];
  const info = t.analyzers[id];
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const content = (
    <Card
      className={cn(
        "group relative h-full overflow-hidden",
        available && "cursor-pointer hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg",
        !available && "opacity-75",
      )}
      data-testid={`analyzer-card-${id}`}
    >
      {available && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 to-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
      )}
      <CardContent className="flex h-full flex-col gap-5 p-6">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
              available
                ? "bg-teal-50 text-teal-600 group-hover:bg-teal-100"
                : "bg-slate-100 text-slate-400",
            )}
          >
            {available ? <Icon className="h-7 w-7" /> : <Lock className="h-5 w-5" />}
          </div>
          <Badge variant={available ? "success" : "muted"}>
            {available
              ? isRtl
                ? "זמין"
                : "Available"
              : t.home.comingSoon}
          </Badge>
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-heading">{info.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            {info.description}
          </p>
        </div>

        {available && (
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--brand)]">
            {isRtl ? "התחל ניתוח" : "Start Analysis"}
            <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </div>
        )}
      </CardContent>
    </Card>
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
