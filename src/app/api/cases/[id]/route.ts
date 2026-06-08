import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { buildCaseSummary } from "@/lib/cases/case-summary";
import type { AnalysisResult } from "@/lib/analyzers/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { id } = await params;
  const clientCase = await prisma.clientCase.findUnique({
    where: { id },
    include: { documents: { orderBy: { createdAt: "desc" } } },
  });

  if (!clientCase) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const summary = buildCaseSummary(
    clientCase.clientName,
    clientCase.taxYear,
    clientCase.documents.map((d) => ({
      id: d.id,
      fileName: d.fileName,
      analyzerId: d.analyzerId,
      status: d.status,
      analysisJson: d.analysisJson as AnalysisResult | null,
    })),
  );

  return NextResponse.json({ ...clientCase, summary });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { id } = await params;
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
    },
  });

  return NextResponse.json(clientCase);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { id } = await params;
  await prisma.clientCase.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
