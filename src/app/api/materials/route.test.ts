import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  authAs,
  authUnauthorized,
  authForbidden,
  parseResponse,
  useRequireRoleMock,
} from "@/test/api-auth-mock";
import { UserRole } from "@/types/user-role";

const mockRequireRole = vi.hoisted(() => vi.fn());
const findMany = vi.hoisted(() => vi.fn());

useRequireRoleMock(mockRequireRole);

vi.mock("@/lib/api-auth", () => ({
  API_UNAUTHORIZED_BODY: { error: "No autenticado" },
  API_FORBIDDEN_BODY: { error: "Prohibido" },
  requireRole: mockRequireRole,
}));

vi.mock("@/lib/db", () => ({
  db: {
    material: { findMany },
  },
}));

import { GET, POST } from "./route";

describe("GET /api/materials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve 401 sin sesión", async () => {
    authUnauthorized();

    const res = await GET(new Request("http://localhost/api/materials"));
    const { status, body } = await parseResponse(res);

    expect(status).toBe(401);
    expect(body).toEqual({ error: "No autenticado" });
    expect(findMany).not.toHaveBeenCalled();
  });

  it("devuelve 403 con rol CLIENT", async () => {
    authForbidden();

    const res = await GET(new Request("http://localhost/api/materials"));
    const { status, body } = await parseResponse(res);

    expect(status).toBe(403);
    expect(body).toEqual({ error: "Prohibido" });
    expect(findMany).not.toHaveBeenCalled();
  });

  it("devuelve 200 con rol WORKER", async () => {
    authAs(UserRole.WORKER);
    findMany.mockResolvedValue([]);

    const res = await GET(new Request("http://localhost/api/materials"));
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body).toEqual([]);
    expect(findMany).toHaveBeenCalledOnce();
  });

  it("devuelve 200 con rol ADMIN", async () => {
    authAs(UserRole.ADMIN);
    findMany.mockResolvedValue([]);

    const res = await GET(new Request("http://localhost/api/materials"));
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body).toEqual([]);
  });
});

describe("POST /api/materials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authAs(UserRole.ADMIN);
  });

  it("devuelve 400 con body inválido", async () => {
    const res = await POST(
      new Request("http://localhost/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "" }),
      }),
    );
    const { status, body } = await parseResponse<{
      error: string;
      issues?: unknown[];
    }>(res);

    expect(status).toBe(400);
    expect(body.error).toBe("Error de validación");
    expect(body.issues).toBeDefined();
  });
});
