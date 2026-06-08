export type PreviewMode = "pdf" | "image" | "none";

export function documentFileUrl(
  caseId: string,
  docId: string,
  disposition: "inline" | "attachment",
): string {
  return `/api/cases/${caseId}/documents/${docId}/file?disposition=${disposition}`;
}

export function resolveMimeType(mimeType: string, fileName: string): string {
  if (mimeType && mimeType !== "application/octet-stream") {
    return mimeType;
  }

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

  return map[ext ?? ""] ?? "application/octet-stream";
}

export function getPreviewMode(mimeType: string, fileName: string): PreviewMode {
  const resolved = resolveMimeType(mimeType, fileName);
  if (resolved === "application/pdf") return "pdf";
  if (resolved.startsWith("image/")) return "image";
  return "none";
}

export function contentDisposition(
  disposition: "inline" | "attachment",
  fileName: string,
): string {
  const safeName = fileName.replace(/[^\w.\-() ]/g, "_");
  return `${disposition}; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}
