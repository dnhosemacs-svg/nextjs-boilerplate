import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";

import { authOptions } from "@/lib/auth";

export const API_UNAUTHORIZED_BODY = { error: "No autenticado" } as const;

type ApiSessionResult =
  | { ok: true; session: Session }
  | { ok: false; response: NextResponse };

/**
 * Segunda capa de auth en route handlers (defensa en profundidad).
 * El middleware ya devuelve 401 JSON en rutas de PROTECTED_API_PREFIXES.
 */
export async function requireApiSession(): Promise<ApiSessionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json(API_UNAUTHORIZED_BODY, { status: 401 }),
    };
  }
  return { ok: true, session };
}
