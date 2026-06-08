import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma, isDatabaseConfigured } from "@/lib/db/prisma";

export async function getAuthUserId(): Promise<string | null> {
  try {
    const session = await auth();
    return session?.user?.id ?? null;
  } catch (error) {
    console.error("[auth] session lookup failed", error);
    return null;
  }
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export async function requireAuthUserId(): Promise<string | NextResponse> {
  const userId = await getAuthUserId();
  if (!userId) {
    return unauthorizedResponse();
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedResponse("Session expired. Please sign in again.");
  }

  return userId;
}

export async function getOwnedCase(caseId: string, userId: string) {
  return prisma.clientCase.findFirst({
    where: { id: caseId, userId },
  });
}
