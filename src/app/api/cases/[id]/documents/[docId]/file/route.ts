import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { contentDisposition, resolveMimeType } from "@/lib/cases/document-file";

type RouteParams = { params: Promise<{ id: string; docId: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { id: caseId, docId } = await params;
  const { searchParams } = new URL(request.url);
  const disposition =
    searchParams.get("disposition") === "attachment" ? "attachment" : "inline";

  const doc = await prisma.document.findFirst({
    where: { id: docId, caseId },
    select: {
      fileName: true,
      mimeType: true,
      fileData: true,
      blobUrl: true,
    },
  });

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const contentType = resolveMimeType(doc.mimeType, doc.fileName);
  const headers = {
    "Content-Type": contentType,
    "Content-Disposition": contentDisposition(disposition, doc.fileName),
    "Cache-Control": "private, max-age=3600",
  };

  if (doc.fileData && doc.fileData.length > 0) {
    return new NextResponse(Buffer.from(doc.fileData), { headers });
  }

  if (doc.blobUrl) {
    if (disposition === "attachment") {
      const blobRes = await fetch(doc.blobUrl);
      if (!blobRes.ok) {
        return NextResponse.json({ error: "File not available" }, { status: 404 });
      }
      const bytes = await blobRes.arrayBuffer();
      return new NextResponse(bytes, { headers });
    }
    return NextResponse.redirect(doc.blobUrl);
  }

  return NextResponse.json({ error: "File not stored" }, { status: 404 });
}
