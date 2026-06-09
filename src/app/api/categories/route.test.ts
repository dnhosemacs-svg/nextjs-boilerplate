import { describe, it, expect, vi, beforeEach } from "vitest";

import { Prisma } from "@/generated/prisma/client";
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
const create = vi.hoisted(() => vi.fn());

useRequireRoleMock(mockRequireRole);

vi.mock("@/lib/api-auth", () => ({
  API_UNAUTHORIZED_BODY: { error: "No autenticado" },
  API_FORBIDDEN_BODY: { error: "Prohibido" },
  requireRole: mockRequireRole,
}));

vi.mock("@/lib/db", () => ({
  db: {
    category: { findMany, create },
  },
}));

import { GET, POST } from "./route";

describe("GET /api/categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve 401 sin sesión", async () => {
    authUnauthorized();

    const res = await GET();
    const { status, body } = await parseResponse(res);

    expect(status).toBe(401);
    expect(body).toEqual({ error: "No autenticado" });
    expect(findMany).not.toHaveBeenCalled();
  });

  it("devuelve 403 con rol CLIENT", async () => {
    authForbidden();

    const res = await GET();
    const { status, body } = await parseResponse(res);

    expect(status).toBe(403);
    expect(body).toEqual({ error: "Prohibido" });
    expect(findMany).not.toHaveBeenCalled();
  });

  it("devuelve 200 con rol WORKER", async () => {
    authAs(UserRole.WORKER);
    findMany.mockResolvedValue([{ id: "cat-1", name: "Madera" }]);

    const res = await GET();
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body).toEqual([{ id: "cat-1", name: "Madera" }]);
    expect(findMany).toHaveBeenCalledWith({ orderBy: { name: "asc" } });
  });
});

describe("POST /api/categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve 401 sin sesión", async () => {
    authUnauthorized();

    const res = await POST(
      new Request("http://localhost/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Herrajes" }),
      }),
    );
    const { status, body } = await parseResponse(res);

    expect(status).toBe(401);
    expect(body).toEqual({ error: "No autenticado" });
    expect(create).not.toHaveBeenCalled();
  });

  it("devuelve 403 con rol WORKER", async () => {
    authForbidden();

    const res = await POST(
      new Request("http://localhost/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Herrajes" }),
      }),
    );
    const { status, body } = await parseResponse(res);

    expect(status).toBe(403);
    expect(body).toEqual({ error: "Prohibido" });
    expect(create).not.toHaveBeenCalled();
  });

  it("devuelve 400 con nombre vacío", async () => {
    authAs(UserRole.ADMIN);

    const res = await POST(
      new Request("http://localhost/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "" }),
      }),
    );
    const { status, body } = await parseResponse<{ error: string }>(res);

    expect(status).toBe(400);
    expect(body.error).toBe("Error de validación");
    expect(create).not.toHaveBeenCalled();
  });

  it("devuelve 201 con ADMIN y body válido", async () => {
    authAs(UserRole.ADMIN);
    create.mockResolvedValue({ id: "cat-new", name: "Herrajes" });

    const res = await POST(
      new Request("http://localhost/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Herrajes" }),
      }),
    );
    const { status, body } = await parseResponse(res);

    expect(status).toBe(201);
    expect(body).toEqual({ id: "cat-new", name: "Herrajes" });
    expect(create).toHaveBeenCalledWith({ data: { name: "Herrajes" } });
  });

  it("devuelve 409 si el nombre ya existe", async () => {
    authAs(UserRole.ADMIN);
    create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint", {
        code: "P2002",
        clientVersion: "test",
      }),
    );

    const res = await POST(
      new Request("http://localhost/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Herrajes" }),
      }),
    );
    const { status, body } = await parseResponse<{ error: string }>(res);

    expect(status).toBe(409);
    expect(body.error).toBe("Ya existe una categoría con ese nombre");
  });
});
