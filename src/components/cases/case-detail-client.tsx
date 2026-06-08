"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Eye,
  ExternalLink,
  Download,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { getAvailableAnalyzers } from "@/lib/analyzers/registry";
import type { AnalysisResult } from "@/lib/analyzers/types";
import type { CaseSummaryResult } from "@/lib/cases/case-summary";
import type { DohShnatiDraft } from "@/lib/cases/doh-shnati-draft";
import type { ClientProfileType } from "@/lib/cases/document-checklist";
import { documentFileUrl } from "@/lib/cases/document-file";
import { DocumentPreviewModal } from "@/components/cases/document-preview-modal";
import { CaseChecklist } from "@/components/cases/case-checklist";
import { DohShnatiDraftPanel } from "@/components/cases/doh-shnati-draft-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

type CaseDocument = {
  id: string;
  fileName: string;
  mimeType: string;
  analyzerId: string;
  status: string;
  periodMonth?: number | null;
  hasFile: boolean;
  analysisJson: AnalysisResult | null;
  errorMessage: string | null;
};

type CaseDetail = {
  id: string;
  clientName: string;
  clientIdNum: string | null;
  taxYear: number;
  status: string;
  clientProfile: ClientProfileType;
  documents: CaseDocument[];
  summary: CaseSummaryResult;
  dohShnati: DohShnatiDraft;
};

type PreviewDoc = Pick<CaseDocument, "id" | "fileName" | "mimeType">;

export function CaseDetailClient({ id }: { id: string }) {
  const { t, locale, isRtl } = useLanguage();
  const [data, setData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedAnalyzer, setSelectedAnalyzer] = useState("form-106");
  const [uploadMonth, setUploadMonth] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<PreviewDoc | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const analyzers = getAvailableAnalyzers();

  const load = useCallback(async () => {
    const res = await fetch(`/api/cases/${id}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await fetch(`/api/cases/${id}`);
      if (cancelled) return;
      if (res.ok) setData(await res.json());
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const uploadFile = async (file: File, month?: number | null) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("analyzerId", selectedAnalyzer);
    formData.append("locale", locale);
    if (month && month >= 1 && month <= 12) {
      formData.append("periodMonth", String(month));
    }

    await fetch(`/api/cases/${id}/documents`, { method: "POST", body: formData });
    await load();
    setUploading(false);
    setUploadMonth(null);
  };

  const updateProfile = async (clientProfile: ClientProfileType) => {
    await fetch(`/api/cases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientProfile }),
    });
    await load();
  };

  const copySummary = async () => {
    if (!data?.summary) return;
    const lines = [
      `${data.clientName} — ${t.cases.taxYear} ${data.taxYear}`,
      "",
      ...data.summary.kpis.map((k) => `${k.label}: ${k.value}`),
      "",
      ...data.summary.insights.map((i) => i.message),
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <p className="text-muted">{isRtl ? "טוען תיק..." : "Loading case..."}</p>;
  }

  if (!data) {
    return (
      <p className="text-muted">
        {t.cases.notFound}{" "}
        <Link href="/cases" className="text-[var(--brand)]">
          {t.cases.back}
        </Link>
      </p>
    );
  }

  return (
    <div className="animate-in space-y-6" data-testid="case-detail">
      <div className="report-header">
        <Link href="/cases" className="text-sm text-white/70 hover:text-white">
          ← {t.cases.back}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{data.clientName}</h1>
        <p className="mt-1 text-white/80">
          {t.cases.taxYear} {data.taxYear}
          {data.clientIdNum ? ` · ${data.clientIdNum}` : ""}
        </p>
        {data.summary.readyForFiling && (
          <Badge variant="success" className="mt-3">
            {t.cases.readyForFiling}
          </Badge>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateProfile("EMPLOYEE")}
            className={cn(
              "rounded-lg border px-3 py-1 text-xs font-semibold",
              data.clientProfile === "EMPLOYEE"
                ? "border-white bg-white/20 text-white"
                : "border-white/30 text-white/70",
            )}
            data-testid="profile-employee"
          >
            {t.cases.profileEmployee}
          </button>
          <button
            type="button"
            onClick={() => updateProfile("SELF_EMPLOYED")}
            className={cn(
              "rounded-lg border px-3 py-1 text-xs font-semibold",
              data.clientProfile === "SELF_EMPLOYED"
                ? "border-white bg-white/20 text-white"
                : "border-white/30 text-white/70",
            )}
            data-testid="profile-self-employed"
          >
            {t.cases.profileSelfEmployed}
          </button>
        </div>
      </div>

      {data.dohShnati && (
        <CaseChecklist
          checklist={data.dohShnati.checklist}
          onUploadForMonth={(month) => {
            setSelectedAnalyzer("pay-slip");
            setUploadMonth(month);
            fileRef.current?.click();
          }}
        />
      )}

      {data.dohShnati && <DohShnatiDraftPanel draft={data.dohShnati} />}

      {data.summary.kpis.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-testid="case-summary-kpis">
          {data.summary.kpis.map((kpi) => (
            <div key={kpi.label} className={cn("kpi-card p-5", kpi.highlight && "kpi-card-highlight")}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {kpi.label}
              </p>
              <p className="amount mt-2 text-2xl font-bold text-heading">{kpi.value}</p>
            </div>
          ))}
        </div>
      )}

      {data.summary.insights.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-heading">{t.cases.caseSummary}</h3>
              <Button variant="outline" size="sm" onClick={copySummary}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? t.analyze.copied : t.analyze.exportSummary}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {data.summary.insights.map((insight, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-lg p-3 text-sm",
                  insight.type === "success" && "insight-success",
                  insight.type === "warning" && "insight-warning",
                  insight.type === "info" && "insight-info",
                )}
              >
                {insight.message}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h3 className="font-bold text-heading">{t.cases.addDocument}</h3>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="flex flex-wrap gap-2">
            {analyzers.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelectedAnalyzer(a.id)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors",
                  selectedAnalyzer === a.id
                    ? "border-[var(--brand)] bg-[var(--brand-light)] text-[var(--brand)]"
                    : "border-[var(--border)] text-muted hover:bg-[var(--surface-hover)]",
                )}
              >
                {t.analyzers[a.id].shortDesc}
              </button>
            ))}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv,.pdf"
            className="hidden"
            data-testid="case-file-input"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f, uploadMonth);
            }}
          />

          {uploadMonth && (
            <p className="text-sm font-semibold text-[var(--brand)]">
              {t.cases.uploadPaySlipMonth} {uploadMonth}
            </p>
          )}

          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="upload-zone flex w-full items-center justify-center gap-3 p-8"
            data-testid="case-upload-btn"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-[var(--brand)]" />
            ) : (
              <Upload className="h-6 w-6 text-[var(--brand)]" />
            )}
            <span className="font-semibold text-heading">
              {uploading ? t.analyze.analyzing : t.cases.uploadAndAnalyze}
            </span>
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-bold text-heading">
            {t.cases.documents} ({data.documents.length})
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          {data.documents.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">{t.cases.noDocuments}</p>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {data.documents.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  caseId={id}
                  doc={doc}
                  onPreview={() =>
                    setPreviewDoc({
                      id: doc.id,
                      fileName: doc.fileName,
                      mimeType: doc.mimeType,
                    })
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {previewDoc && (
        <DocumentPreviewModal
          caseId={id}
          docId={previewDoc.id}
          fileName={previewDoc.fileName}
          mimeType={previewDoc.mimeType}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}

function DocumentRow({
  caseId,
  doc,
  onPreview,
}: {
  caseId: string;
  doc: CaseDocument;
  onPreview: () => void;
}) {
  const { t } = useLanguage();
  const inlineUrl = documentFileUrl(caseId, doc.id, "inline");
  const downloadUrl = documentFileUrl(caseId, doc.id, "attachment");

  return (
    <div className="flex flex-wrap items-center gap-3 py-4" data-testid={`doc-row-${doc.id}`}>
      <FileText className="h-5 w-5 shrink-0 text-[var(--brand)]" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-heading">{doc.fileName}</p>
        <p className="text-xs text-muted">
          {t.analyzers[doc.analyzerId as keyof typeof t.analyzers]?.shortDesc ??
            doc.analyzerId}
          {doc.periodMonth ? ` · ${doc.periodMonth}/12` : ""}
        </p>
      </div>

      {doc.hasFile && (
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            title={t.cases.preview}
            onClick={onPreview}
            data-testid={`doc-preview-${doc.id}`}
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">{t.cases.preview}</span>
          </Button>
          <a href={inlineUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" title={t.cases.open} data-testid={`doc-open-${doc.id}`}>
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">{t.cases.open}</span>
            </Button>
          </a>
          <a href={downloadUrl} download={doc.fileName}>
            <Button variant="ghost" size="sm" title={t.cases.download} data-testid={`doc-download-${doc.id}`}>
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">{t.cases.download}</span>
            </Button>
          </a>
        </div>
      )}

      {doc.status === "ANALYZED" && (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--success)]" />
      )}
      {doc.status === "ERROR" && (
        <AlertCircle className="h-5 w-5 shrink-0 text-[var(--danger)]" />
      )}
      {doc.status === "PENDING" && (
        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-muted" />
      )}
      {doc.analysisJson?.summary.kpis[0] && (
        <span className="amount hidden text-sm font-bold text-heading sm:block">
          {doc.analysisJson.summary.kpis[0].value}
        </span>
      )}
    </div>
  );
}
