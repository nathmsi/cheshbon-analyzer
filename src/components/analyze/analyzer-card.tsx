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
        "group relative overflow-hidden transition-all duration-200",
        available
          ? "cursor-pointer hover:border-teal-300 hover:shadow-md hover:-translate-y-0.5"
          : "opacity-70",
      )}
    >
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              available
                ? "bg-teal-50 text-teal-600 group-hover:bg-teal-100"
                : "bg-slate-100 text-slate-400",
            )}
          >
            {available ? <Icon className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
          </div>
          {!available && (
            <Badge variant="muted">{t.home.comingSoon}</Badge>
          )}
          {available && (
            <Badge variant="success">
              {isRtl ? "זמין" : "Available"}
            </Badge>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-900">{info.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
            {info.description}
          </p>
        </div>

        {available && (
          <div className="flex items-center gap-1.5 text-sm font-medium text-teal-600">
            {isRtl ? "התחל ניתוח" : "Start Analysis"}
            <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (available) {
    return <Link href={`/analyze/${id}`}>{content}</Link>;
  }

  return content;
}
