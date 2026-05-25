import { NextResponse } from "next/server";

import { Prisma } from "@/generated/prisma/client";

type PrismaWriteErrorMessages = {
  unique?: string;
  foreignKey?: string;
};

export function handlePrismaWriteError(
  error: unknown,
  messages: PrismaWriteErrorMessages,
): NextResponse | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return null;
  }

  if (error.code === "P2002" && messages.unique) {
    return NextResponse.json({ error: messages.unique }, { status: 409 });
  }

  if (error.code === "P2003" && messages.foreignKey) {
    return NextResponse.json({ error: messages.foreignKey }, { status: 400 });
  }

  return null;
}
