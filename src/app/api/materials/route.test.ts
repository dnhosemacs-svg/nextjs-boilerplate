import { describe, it, expect, vi, beforeEach } from "vitest";

import { Prisma } from "@/generated/prisma/client";
import {
  authAs,
  authUnauthorized,
  authForbidden,
  parseResponse,
  bindRequireRoleMock,
} from "@/test/api-auth-mock";
import { UserRole } from "@/types/user-role";

const mockRequireRole = vi.hoisted(() => vi.fn());
const findMany = vi.hoisted(() => vi.fn());
const create = vi.hoisted(() => vi.fn());
const captureServerError = vi.hoisted(() => vi.fn());

function decimal(value: string) {
  return { toString: () => value };
}

bindRequireRoleMock(mockRequireRole);

vi.mock("@/lib/api-auth", () => ({
  API_UNAUTHORIZED_BODY: { error: "No autenticado" },
  API_FORBIDDEN_BODY: { error: "Prohibido" },
  requireRole: mockRequireRole,
}));

vi.mock("@/lib/db", () => ({
  db: {
    material: { findMany, create },
  },
}));

vi.mock("@/lib/capture-server-error", () => ({
  captureServerError,
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

  it("aplica filtro search en la consulta", async () => {
    authAs(UserRole.WORKER);
    findMany.mockResolvedValue([]);

    await GET(
      new Request("http://localhost/api/materials?search=tablero&sortBy=stock&sortOrder=desc"),
    );

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { name: { contains: "tablero", mode: "insensitive" } },
            { sku: { contains: "tablero", mode: "insensitive" } },
            { location: { contains: "tablero", mode: "insensitive" } },
          ],
        },
        orderBy: { stock: "desc" },
      }),
    );
  });

  it("devuelve 400 con query inválida", async () => {
    authAs(UserRole.WORKER);

    const res = await GET(
      new Request("http://localhost/api/materials?sortBy=invalido"),
    );
    const { status, body } = await parseResponse<{ error: string }>(res);

    expect(status).toBe(400);
    expect(body.error).toBe("Error de validación");
    expect(findMany).not.toHaveBeenCalled();
  });

  it("filtra por categoryId", async () => {
    authAs(UserRole.WORKER);
    findMany.mockResolvedValue([]);

    await GET(new Request("http://localhost/api/materials?categoryId=cat-1"));

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { categoryId: "cat-1" },
      }),
    );
  });

  it("ordena por unitCost cuando se solicita", async () => {
    authAs(UserRole.WORKER);
    findMany.mockResolvedValue([]);

    await GET(
      new Request("http://localhost/api/materials?sortBy=unitCost&sortOrder=asc"),
    );

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { unitCost: "asc" },
      }),
    );
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

  it("devuelve 201 con body válido", async () => {
    const createdAt = new Date("2024-06-01T10:00:00.000Z");
    create.mockResolvedValue({
      id: "mat-new",
      name: "Tablero roble",
      sku: null,
      unit: "UD",
      unitCost: decimal("25.5"),
      stock: decimal("0"),
      minStock: decimal("2"),
      location: null,
      categoryId: "cat-1",
      createdAt,
      updatedAt: createdAt,
      category: {
        id: "cat-1",
        name: "Madera",
        createdAt,
        updatedAt: createdAt,
      },
    });

    const res = await POST(
      new Request("http://localhost/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Tablero roble",
          unit: "UD",
          unitCost: 25.5,
          minStock: 2,
          categoryId: "cat-1",
        }),
      }),
    );
    const { status, body } = await parseResponse<{
      id: string;
      unitCost: string;
      stock: string;
      minStock: string;
    }>(res);

    expect(status).toBe(201);
    expect(body.id).toBe("mat-new");
    expect(body.unitCost).toBe("25.5");
    expect(body.stock).toBe("0");
    expect(body.minStock).toBe("2");
  });

  it("devuelve 409 si el SKU ya existe", async () => {
    create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint", {
        code: "P2002",
        clientVersion: "test",
      }),
    );

    const res = await POST(
      new Request("http://localhost/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Tablero",
          sku: "SKU-1",
          unit: "UD",
          unitCost: 10,
          minStock: 0,
          categoryId: "cat-1",
        }),
      }),
    );
    const { status, body } = await parseResponse<{ error: string }>(res);

    expect(status).toBe(409);
    expect(body.error).toBe("Ya existe un material con ese SKU");
  });

  it("relanza y reporta errores de base de datos no mapeados", async () => {
    const dbError = new Error("db down");
    create.mockRejectedValue(dbError);

    await expect(
      POST(
        new Request("http://localhost/api/materials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Tablero",
            unit: "UD",
            unitCost: 10,
            minStock: 0,
            categoryId: "cat-1",
          }),
        }),
      ),
    ).rejects.toThrow("db down");

    expect(captureServerError).toHaveBeenCalledWith(dbError, {
      route: "POST /api/materials",
      tags: { module: "inventory" },
    });
  });
});
