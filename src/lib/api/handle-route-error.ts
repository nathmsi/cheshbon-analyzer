import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

export function handleRouteError(error: unknown, context: string) {
  console.error(`[${context}]`, error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Session expired. Please sign in again." },
        { status: 401 },
      );
    }
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
