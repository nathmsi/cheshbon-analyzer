import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db/prisma";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const cases = await prisma.clientCase.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      documents: {
        select: { id: true, status: true, analyzerId: true },
      },
    },
  });

  return NextResponse.json(
    cases.map((c) => ({
      id: c.id,
      clientName: c.clientName,
      clientIdNum: c.clientIdNum,
      taxYear: c.taxYear,
      status: c.status,
      notes: c.notes,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      documentCount: c.documents.length,
      analyzedCount: c.documents.filter((d) => d.status === "ANALYZED").length,
    })),
  );
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json();
  const { clientName, clientIdNum, taxYear, notes } = body;

  if (!clientName || !taxYear) {
    return NextResponse.json(
      { error: "clientName and taxYear are required" },
      { status: 400 },
    );
  }

  const clientCase = await prisma.clientCase.create({
    data: {
      clientName: String(clientName),
      clientIdNum: clientIdNum ? String(clientIdNum) : null,
      taxYear: Number(taxYear),
      notes: notes ? String(notes) : null,
      status: "DRAFT",
    },
  });

  return NextResponse.json(clientCase, { status: 201 });
}
