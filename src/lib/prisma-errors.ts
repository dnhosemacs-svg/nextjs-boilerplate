import { NextResponse } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import { jsonApiError } from "@/lib/api-error";

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
    return jsonApiError(messages.unique, 409);
  }

  if (error.code === "P2003" && messages.foreignKey) {
    return jsonApiError(messages.foreignKey, 400);
  }

  return null;
}
