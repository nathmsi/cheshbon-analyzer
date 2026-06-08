import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { analyzeFileBuffer } from "@/lib/analyzers/parse-buffer";
import type { AnalysisResult } from "@/lib/analyzers/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { id: caseId } = await params;

  const existingCase = await prisma.clientCase.findUnique({ where: { id: caseId } });
  if (!existingCase) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const analyzerId = formData.get("analyzerId") as string | null;
  const locale = (formData.get("locale") as "he" | "en") || "he";

  if (!file || !analyzerId) {
    return NextResponse.json(
      { error: "file and analyzerId are required" },
      { status: 400 },
    );
  }

  const buffer = await file.arrayBuffer();
  let blobUrl: string | null = null;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(
        `cases/${caseId}/${Date.now()}-${file.name}`,
        Buffer.from(buffer),
        { access: "public" },
      );
      blobUrl = blob.url;
    } catch {
      // Blob optional — analysis still saved
    }
  }

  const doc = await prisma.document.create({
    data: {
      caseId,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      fileSize: file.size,
      blobUrl,
      analyzerId,
      status: "PENDING",
    },
  });

  try {
    const analysis = await analyzeFileBuffer(buffer, file.name, analyzerId, locale);

    const updated = await prisma.document.update({
      where: { id: doc.id },
      data: {
        status: "ANALYZED",
        analysisJson: analysis as unknown as object,
        analyzedAt: new Date(),
      },
    });

    await prisma.clientCase.update({
      where: { id: caseId },
      data: { status: "IN_PROGRESS", updatedAt: new Date() },
    });

    return NextResponse.json({
      document: updated,
      analysis: analysis as AnalysisResult,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    const updated = await prisma.document.update({
      where: { id: doc.id },
      data: { status: "ERROR", errorMessage: message },
    });
    return NextResponse.json({ document: updated, error: message }, { status: 422 });
  }
}
