import { NextResponse } from "next/server";
import { vi } from "vitest";

import type { UserRole } from "@/types/user-role";

/** Mock hoisted: Vitest lo eleva antes de vi.mock */
export const mockRequireRole = vi.hoisted(() => vi.fn());

/** Sesión autenticada con el rol indicado */
export function authAs(role: UserRole, userId = "user-test-1") {
  mockRequireRole.mockResolvedValue({
    ok: true,
    session: {
      user: { id: userId, role },
    },
  });
}

/** Simula 401 — sin sesión */
export function authUnauthorized() {
  mockRequireRole.mockResolvedValue({
    ok: false,
    response: NextResponse.json(
      { error: "No autenticado" },
      { status: 401 },
    ),
  });
}

/** Simula 403 — rol sin permiso */
export function authForbidden() {
  mockRequireRole.mockResolvedValue({
    ok: false,
    response: NextResponse.json({ error: "Prohibido" }, { status: 403 }),
  });
}

/** Parsea status + JSON de la Response del handler */
export async function parseResponse<T = unknown>(response: Response) {
  return {
    status: response.status,
    body: (await response.json()) as T,
  };
}
