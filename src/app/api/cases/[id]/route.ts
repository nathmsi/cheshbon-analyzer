import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { buildCaseSummary } from "@/lib/cases/case-summary";
import { buildDohShnatiDraft } from "@/lib/cases/doh-shnati-draft";
import type { AnalysisResult } from "@/lib/analyzers/types";
import type { ClientProfileType } from "@/lib/cases/document-checklist";
import { getOwnedCase, requireAuthUserId } from "@/lib/auth/require-user";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const userId = await requireAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await params;
  const owned = await getOwnedCase(id, userId);
  if (!owned) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const clientCase = await prisma.clientCase.findUnique({
    where: { id },
    include: {
      documents: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fileName: true,
          mimeType: true,
          fileSize: true,
          blobUrl: true,
          analyzerId: true,
          periodMonth: true,
          status: true,
          analysisJson: true,
          errorMessage: true,
          analyzedAt: true,
          createdAt: true,
        },
      },
    },
  });

  if (!clientCase) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const fileFlags = await prisma.$queryRaw<Array<{ id: string; has_file: boolean }>>`
    SELECT id, (file_data IS NOT NULL OR blob_url IS NOT NULL) AS has_file
    FROM documents
    WHERE case_id = ${id}
  `;
  const hasFileMap = new Map(fileFlags.map((f) => [f.id, f.has_file]));

  const documents = clientCase.documents.map((d) => ({
    ...d,
    hasFile: hasFileMap.get(d.id) ?? false,
  }));

  const summary = buildCaseSummary(
    clientCase.clientName,
    clientCase.taxYear,
    documents.map((d) => ({
      id: d.id,
      fileName: d.fileName,
      analyzerId: d.analyzerId,
      status: d.status,
      analysisJson: d.analysisJson as AnalysisResult | null,
    })),
  );

  const dohShnati = buildDohShnatiDraft(
    clientCase.clientName,
    clientCase.clientIdNum,
    clientCase.taxYear,
    clientCase.clientProfile as ClientProfileType,
    documents.map((d) => ({
      id: d.id,
      fileName: d.fileName,
      analyzerId: d.analyzerId,
      status: d.status,
      periodMonth: d.periodMonth,
      analysisJson: d.analysisJson as AnalysisResult | null,
    })),
  );

  const { documents: _docs, ...caseData } = clientCase;
  return NextResponse.json({ ...caseData, documents, summary, dohShnati });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const userId = await requireAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await params;
  const owned = await getOwnedCase(id, userId);
  if (!owned) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const body = await request.json();

  const clientCase = await prisma.clientCase.update({
    where: { id },
    data: {
      ...(body.clientName !== undefined && { clientName: String(body.clientName) }),
      ...(body.clientIdNum !== undefined && {
        clientIdNum: body.clientIdNum ? String(body.clientIdNum) : null,
      }),
      ...(body.taxYear !== undefined && { taxYear: Number(body.taxYear) }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.notes !== undefined && { notes: body.notes ? String(body.notes) : null }),
      ...(body.clientProfile !== undefined && {
        clientProfile: body.clientProfile === "SELF_EMPLOYED" ? "SELF_EMPLOYED" : "EMPLOYEE",
      }),
    },
  });

  return NextResponse.json(clientCase);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const userId = await requireAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await params;
  const owned = await getOwnedCase(id, userId);
  if (!owned) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  await prisma.clientCase.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
