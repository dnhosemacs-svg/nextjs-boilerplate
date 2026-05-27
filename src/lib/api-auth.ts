import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";

import { authOptions } from "@/lib/auth";
import { isUserRole, type UserRole } from "@/types/user-role";

export const API_UNAUTHORIZED_BODY = { error: "No autenticado" } as const;
export const API_FORBIDDEN_BODY = { error: "Prohibido" } as const;

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

/**
 * Sesión válida + rol permitido. Devuelve 401 sin sesión, 403 sin permiso.
 */
export async function requireRole(
  ...allowed: UserRole[]
): Promise<ApiSessionResult> {
  const auth = await requireApiSession();
  if (!auth.ok) return auth;

  const role = auth.session.user.role;
  if (!isUserRole(role) || !allowed.includes(role)) {
    return {
      ok: false,
      response: NextResponse.json(API_FORBIDDEN_BODY, { status: 403 }),
    };
  }

  return auth;
}
