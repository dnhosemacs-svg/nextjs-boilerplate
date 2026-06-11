import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

import { requireRole } from "@/lib/api-auth";
import { UserRole } from "@/types/user-role";

function isSentryDebugRouteEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.SENTRY_ENABLE_DEBUG_ROUTE === "true";
}

export async function GET() {
  if (!isSentryDebugRouteEnabled()) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const auth = await requireRole(UserRole.ADMIN);
  if (!auth.ok) return auth.response;

  const error = new Error("Sentry test — inventario (controlado)");
  Sentry.captureException(error, {
    tags: { module: "inventory", test: "true" },
  });

  throw error;
}
