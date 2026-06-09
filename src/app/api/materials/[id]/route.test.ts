import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  authAs,
  authForbidden,
  parseResponse,
  bindRequireRoleMock,
} from "@/test/api-auth-mock";
import { UserRole } from "@/types/user-role";

const mockRequireRole = vi.hoisted(() => vi.fn());
const findUnique = vi.hoisted(() => vi.fn());
const update = vi.hoisted(() => vi.fn());
const deleteMaterial = vi.hoisted(() => vi.fn());

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
    material: { findUnique, update, delete: deleteMaterial },
  },
}));

import { GET, PATCH, DELETE } from "./route";

const MATERIAL_ID = "mat-abc-123";
const routeContext = { params: Promise.resolve({ id: MATERIAL_ID }) };

const rawMaterial = {
  id: MATERIAL_ID,
  name: "Tablero",
  sku: null,
  unit: "UD",
  unitCost: decimal("10"),
  stock: decimal("5"),
  minStock: decimal("1"),
  location: null,
  categoryId: "cat-1",
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  category: {
    id: "cat-1",
    name: "Madera",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  },
};

describe("GET /api/materials/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authAs(UserRole.WORKER);
  });

  it("devuelve 200 con material serializado", async () => {
    findUnique.mockResolvedValue(rawMaterial);

    const res = await GET(
      new Request(`http://localhost/api/materials/${MATERIAL_ID}`),
      routeContext,
    );
    const { status, body } = await parseResponse<{ id: string; unitCost: string }>(res);

    expect(status).toBe(200);
    expect(body.id).toBe(MATERIAL_ID);
    expect(body.unitCost).toBe("10");
  });

  it("devuelve 404 si no existe", async () => {
    findUnique.mockResolvedValue(null);

    const res = await GET(
      new Request(`http://localhost/api/materials/${MATERIAL_ID}`),
      routeContext,
    );
    const { status, body } = await parseResponse(res);

    expect(status).toBe(404);
    expect(body).toEqual({ error: "No encontrado" });
  });
});

describe("PATCH /api/materials/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve 403 con rol WORKER", async () => {
    authForbidden();

    const res = await PATCH(
      new Request(`http://localhost/api/materials/${MATERIAL_ID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Nuevo nombre" }),
      }),
      routeContext,
    );

    expect((await parseResponse(res)).status).toBe(403);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("devuelve 200 con ADMIN y actualización válida", async () => {
    authAs(UserRole.ADMIN);
    findUnique.mockResolvedValue(rawMaterial);
    update.mockResolvedValue({ ...rawMaterial, name: "Tablero roble" });

    const res = await PATCH(
      new Request(`http://localhost/api/materials/${MATERIAL_ID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Tablero roble" }),
      }),
      routeContext,
    );
    const { status, body } = await parseResponse<{ name: string }>(res);

    expect(status).toBe(200);
    expect(body.name).toBe("Tablero roble");
  });
});

describe("DELETE /api/materials/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authAs(UserRole.ADMIN);
  });

  it("devuelve 200 al eliminar material existente", async () => {
    findUnique.mockResolvedValue(rawMaterial);
    deleteMaterial.mockResolvedValue(rawMaterial);

    const res = await DELETE(
      new Request(`http://localhost/api/materials/${MATERIAL_ID}`, {
        method: "DELETE",
      }),
      routeContext,
    );

    expect((await parseResponse(res)).status).toBe(200);
    expect(deleteMaterial).toHaveBeenCalledWith({ where: { id: MATERIAL_ID } });
  });
});
