"use client";

import { X, Download, ExternalLink, FileSpreadsheet } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  documentFileUrl,
  getPreviewMode,
} from "@/lib/cases/document-file";
import { Button } from "@/components/ui/button";

type DocumentPreviewModalProps = {
  caseId: string;
  docId: string;
  fileName: string;
  mimeType: string;
  onClose: () => void;
};

export function DocumentPreviewModal({
  caseId,
  docId,
  fileName,
  mimeType,
  onClose,
}: DocumentPreviewModalProps) {
  const { t } = useLanguage();
  const previewMode = getPreviewMode(mimeType, fileName);
  const inlineUrl = documentFileUrl(caseId, docId, "inline");
  const downloadUrl = documentFileUrl(caseId, docId, "attachment");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      data-testid="document-preview-modal"
      onClick={onClose}
    >
      <div
        className="panel flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
          <p className="truncate font-semibold text-heading">{fileName}</p>
          <div className="flex shrink-0 items-center gap-1">
            <a href={inlineUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" title={t.cases.open}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
            <a href={downloadUrl} download={fileName}>
              <Button variant="ghost" size="sm" title={t.cases.download}>
                <Download className="h-4 w-4" />
              </Button>
            </a>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="preview-close">
              <X className="h-4 w-4" />
              <span className="sr-only">{t.cases.close}</span>
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-[var(--surface-hover)]">
          {previewMode === "pdf" && (
            <iframe
              src={inlineUrl}
              title={fileName}
              className="h-[70vh] w-full border-0"
              data-testid="preview-pdf"
            />
          )}

          {previewMode === "image" && (
            <div className="flex min-h-[40vh] items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={inlineUrl}
                alt={fileName}
                className="max-h-[70vh] max-w-full rounded-lg object-contain"
                data-testid="preview-image"
              />
            </div>
          )}

          {previewMode === "none" && (
            <div
              className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center"
              data-testid="preview-unavailable"
            >
              <FileSpreadsheet className="h-12 w-12 text-muted" />
              <p className="max-w-sm text-sm text-muted">{t.cases.previewNotAvailable}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <a href={inlineUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4" />
                    {t.cases.open}
                  </Button>
                </a>
                <a href={downloadUrl} download={fileName}>
                  <Button size="sm">
                    <Download className="h-4 w-4" />
                    {t.cases.download}
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
