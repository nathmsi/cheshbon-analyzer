export type PreviewKind = "pdf" | "image" | "text" | "none";

export function resolveMimeType(mimeType: string, fileName: string): string {
  if (mimeType && mimeType !== "application/octet-stream") return mimeType;
  const ext = fileName.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    pdf: "application/pdf",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    csv: "text/csv",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
  };
  return (ext && map[ext]) || "application/octet-stream";
}

export function getPreviewKind(mimeType: string, fileName: string): PreviewKind {
  const resolved = resolveMimeType(mimeType, fileName);
  if (resolved === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
    return "pdf";
  }
  if (resolved.startsWith("image/")) return "image";
  if (resolved === "text/csv" || fileName.toLowerCase().endsWith(".csv")) return "text";
  return "none";
}

export function documentFileUrl(
  caseId: string,
  docId: string,
  options?: { download?: boolean },
): string {
  const disposition = options?.download ? "attachment" : "inline";
  return `/api/cases/${caseId}/documents/${docId}/file?disposition=${disposition}`;
}
