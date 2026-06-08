import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { requireAuthUserId } from "@/lib/auth/require-user";
import { handleRouteError } from "@/lib/api/handle-route-error";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const userId = await requireAuthUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    const cases = await prisma.clientCase.findMany({
      where: { userId },
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
  } catch (error) {
    return handleRouteError(error, "GET /api/cases");
  }
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const userId = await requireAuthUserId();
  if (userId instanceof NextResponse) return userId;

  try {
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
        userId,
        clientName: String(clientName),
        clientIdNum: clientIdNum ? String(clientIdNum) : null,
        taxYear: Number(taxYear),
        notes: notes ? String(notes) : null,
        status: "DRAFT",
      },
    });

    return NextResponse.json(clientCase, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "POST /api/cases");
  }
}
