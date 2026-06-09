import { NextResponse } from "next/server";
import type { Mock } from "vitest";

import type { UserRole } from "@/types/user-role";

type RequireRoleResult =
  | {
      ok: true;
      session: { user: { id: string; role: UserRole } };
    }
  | { ok: false; response: Response };

let requireRoleMock: Mock<() => Promise<RequireRoleResult>> | undefined;

/** Enlaza el mock hoisted del archivo de test (obligatorio una vez por suite). */
export function bindRequireRoleMock(
  mock: Mock<() => Promise<RequireRoleResult>>,
) {
  requireRoleMock = mock;
}

function mockRequireRole() {
  if (!requireRoleMock) {
    throw new Error(
      "bindRequireRoleMock() debe llamarse antes de authAs/authUnauthorized/authForbidden",
    );
  }
  return requireRoleMock;
}

/** Sesión autenticada con el rol indicado */
export function authAs(role: UserRole, userId = "user-test-1") {
  mockRequireRole().mockResolvedValue({
    ok: true,
    session: {
      user: { id: userId, role },
    },
  });
}

/** Simula 401 — sin sesión */
export function authUnauthorized() {
  mockRequireRole().mockResolvedValue({
    ok: false,
    response: NextResponse.json(
      { error: "No autenticado" },
      { status: 401 },
    ),
  });
}

/** Simula 403 — rol sin permiso */
export function authForbidden() {
  mockRequireRole().mockResolvedValue({
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
