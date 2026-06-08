"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileSpreadsheet, X, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils/cn";

type FileUploadZoneProps = {
  onFileSelect: (file: File) => void;
  isAnalyzing?: boolean;
  selectedFile?: File | null;
  onClear?: () => void;
};

const ACCEPTED_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  ".xlsx",
  ".xls",
  ".csv",
];

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
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !["xlsx", "xls", "csv"].includes(ext)) return;
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
      <div className="flex items-center gap-4 rounded-2xl border-2 border-teal-200 bg-teal-50/50 p-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
          {isAnalyzing ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-7 w-7" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-slate-900">{selectedFile.name}</p>
          <p className="text-sm text-slate-500">
            {isAnalyzing
              ? t.analyze.analyzing
              : `${(selectedFile.size / 1024).toFixed(1)} KB`}
          </p>
        </div>
        {!isAnalyzing && onClear && (
          <button
            onClick={onClear}
            className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-slate-600"
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
        "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-all",
        isDragging
          ? "border-teal-400 bg-teal-50/50"
          : "border-slate-200 bg-slate-50/50 hover:border-teal-300 hover:bg-teal-50/30",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
        <Upload className="h-8 w-8 text-teal-600" />
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-slate-900">{t.analyze.uploadTitle}</p>
        <p className="mt-1 text-sm text-slate-500">{t.analyze.uploadSubtitle}</p>
        <p className="mt-2 text-xs text-slate-400">{t.analyze.supportedFormats}</p>
      </div>
    </div>
  );
}
