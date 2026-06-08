"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileSpreadsheet, FileText, X, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { isAcceptedFile } from "@/lib/analyzers/excel-parser";
import { cn } from "@/lib/utils/cn";

type FileUploadZoneProps = {
  onFileSelect: (file: File) => void;
  isAnalyzing?: boolean;
  selectedFile?: File | null;
  onClear?: () => void;
};

const ACCEPTED_MIME = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "application/pdf",
  ".xlsx",
  ".xls",
  ".csv",
  ".pdf",
].join(",");

function FileIcon({ fileName, className }: { fileName: string; className?: string }) {
  const isPdf = fileName.toLowerCase().endsWith(".pdf");
  const Icon = isPdf ? FileText : FileSpreadsheet;
  return <Icon className={className} />;
}

export function FileUploadZone({
  onFileSelect,
  isAnalyzing = false,
  selectedFile,
  onClear,
}: FileUploadZoneProps) {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!isAcceptedFile(file.name)) return;
      onFileSelect(file);
    },
    [onFileSelect],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  if (selectedFile) {
    return (
      <div
        className="file-selected flex items-center gap-4 rounded-2xl p-6"
        data-testid="file-selected"
      >
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-light)] text-[var(--brand)]">
          {isAnalyzing ? (
            <Loader2 className="h-8 w-8 animate-spin" data-testid="analyzing-spinner" />
          ) : (
            <FileIcon fileName={selectedFile.name} className="h-8 w-8" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-heading">
            {selectedFile.name}
          </p>
          <p className="text-sm text-muted">
            {isAnalyzing
              ? t.analyze.analyzing
              : `${(selectedFile.size / 1024).toFixed(1)} KB`}
          </p>
        </div>
        {!isAnalyzing && onClear && (
          <button
            onClick={onClear}
            aria-label="Clear file"
            className="rounded-xl p-2.5 text-muted transition-colors hover:bg-[var(--surface-hover)] hover:text-heading"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "upload-zone flex cursor-pointer flex-col items-center justify-center gap-5 p-12 sm:p-16",
        isDragging && "dragging",
      )}
      data-testid="upload-zone"
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MIME}
        className="hidden"
        data-testid="file-input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--surface)] shadow-md ring-1 ring-[var(--border)]">
        <Upload className="h-9 w-9 text-[var(--brand)]" />
      </div>
      <div className="max-w-sm text-center">
        <p className="text-xl font-bold text-heading">{t.analyze.uploadTitle}</p>
        <p className="mt-2 text-[15px] text-muted">{t.analyze.uploadSubtitle}</p>
        <p className="mt-3 inline-block rounded-full bg-[var(--surface-hover)] px-4 py-1.5 text-xs font-medium text-muted">
          {t.analyze.supportedFormats}
        </p>
      </div>
    </div>
  );
}
