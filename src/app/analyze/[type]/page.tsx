"use client";

import { use } from "react";
import { AnalyzePageClient } from "./analyze-client";

export default function AnalyzePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = use(params);
  return <AnalyzePageClient type={type} />;
}
