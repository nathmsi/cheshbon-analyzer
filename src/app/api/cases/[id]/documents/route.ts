import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { analyzeFileBuffer } from "@/lib/analyzers/parse-buffer";
import type { AnalysisResult } from "@/lib/analyzers/types";
import { detectPaySlipMonth } from "@/lib/cases/detect-pay-slip-month";
import { getOwnedCase, requireAuthUserId } from "@/lib/auth/require-user";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const userId = await requireAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const { id: caseId } = await params;

  const existingCase = await getOwnedCase(caseId, userId);
  if (!existingCase) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const analyzerId = formData.get("analyzerId") as string | null;
  const locale = (formData.get("locale") as "he" | "en") || "he";
  const periodMonthRaw = formData.get("periodMonth");
  const periodMonth =
    periodMonthRaw !== null && periodMonthRaw !== ""
      ? Number(periodMonthRaw)
      : undefined;

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
      fileData: Buffer.from(buffer),
      analyzerId,
      status: "PENDING",
    },
  });

  try {
    const analysis = await analyzeFileBuffer(buffer, file.name, analyzerId, locale);

    const resolvedPeriodMonth =
      analyzerId === "pay-slip"
        ? (periodMonth && periodMonth >= 1 && periodMonth <= 12
            ? periodMonth
            : detectPaySlipMonth(file.name, analysis))
        : null;

    const updated = await prisma.document.update({
      where: { id: doc.id },
      data: {
        status: "ANALYZED",
        analysisJson: analysis as unknown as object,
        analyzedAt: new Date(),
        ...(resolvedPeriodMonth ? { periodMonth: resolvedPeriodMonth } : {}),
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
