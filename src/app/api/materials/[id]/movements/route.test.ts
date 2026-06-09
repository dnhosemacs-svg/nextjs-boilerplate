import { describe, it, expect, vi, beforeEach } from "vitest";

import { Prisma } from "@/generated/prisma/client";
import {
  authAs,
  authForbidden,
  parseResponse,
  useRequireRoleMock,
} from "@/test/api-auth-mock";
import { UserRole } from "@/types/user-role";

const mockRequireRole = vi.hoisted(() => vi.fn());
const findUnique = vi.hoisted(() => vi.fn());
const findMany = vi.hoisted(() => vi.fn());
const recordMovement = vi.hoisted(() => vi.fn());

useRequireRoleMock(mockRequireRole);

vi.mock("@/lib/api-auth", () => ({
  API_UNAUTHORIZED_BODY: { error: "No autenticado" },
  API_FORBIDDEN_BODY: { error: "Prohibido" },
  requireRole: mockRequireRole,
}));

vi.mock("@/lib/db", () => ({
  db: {
    material: { findUnique },
    stockMovement: { findMany },
  },
}));

vi.mock("@/lib/stock-service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/stock-service")>();
  return {
    ...actual,
    recordMovement,
  };
});

import { GET, POST } from "./route";

const MATERIAL_ID = "mat-abc-123";
const routeContext = { params: Promise.resolve({ id: MATERIAL_ID }) };

describe("GET /api/materials/[id]/movements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authAs(UserRole.WORKER);
  });

  it("devuelve 200 con movimientos serializados", async () => {
    findUnique.mockResolvedValue({ id: MATERIAL_ID });
    findMany.mockResolvedValue([
      {
        id: "mov-1",
        type: "IN",
        quantity: new Prisma.Decimal(5),
        reason: null,
        materialId: MATERIAL_ID,
        orderId: null,
        userId: "user-1",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
      },
    ]);

    const res = await GET(
      new Request(`http://localhost/api/materials/${MATERIAL_ID}/movements`),
      routeContext,
    );
    const { status, body } = await parseResponse<Array<{ quantity: string }>>(res);

    expect(status).toBe(200);
    expect(body[0]?.quantity).toBe("5");
  });

  it("devuelve 404 si el material no existe", async () => {
    findUnique.mockResolvedValue(null);

    const res = await GET(
      new Request(`http://localhost/api/materials/${MATERIAL_ID}/movements`),
      routeContext,
    );

    expect((await parseResponse(res)).status).toBe(404);
  });
});

describe("POST /api/materials/[id]/movements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authAs(UserRole.WORKER);
  });

  it("devuelve 400 para tipo de movimiento no válido", async () => {
    const res = await POST(
      new Request(`http://localhost/api/materials/${MATERIAL_ID}/movements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "OUT", quantity: 1 }),
      }),
      routeContext,
    );
    const { status, body } = await parseResponse<{ error: string }>(res);

    expect(status).toBe(400);
    expect(body.error).toBe("Tipo de movimiento no válido");
    expect(recordMovement).not.toHaveBeenCalled();
  });

  it("devuelve 403 si WORKER intenta ADJUST", async () => {
    authForbidden();

    const res = await POST(
      new Request(`http://localhost/api/materials/${MATERIAL_ID}/movements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "ADJUST", quantity: 1, reason: "Ajuste" }),
      }),
      routeContext,
    );

    expect((await parseResponse(res)).status).toBe(403);
    expect(recordMovement).not.toHaveBeenCalled();
  });

  it("devuelve 201 al registrar entrada IN", async () => {
    recordMovement.mockResolvedValue({
      movement: { id: "mov-1", type: "IN", quantity: "3" },
      stock: { physical: "3", reserved: "0", available: "3" },
    });

    const res = await POST(
      new Request(`http://localhost/api/materials/${MATERIAL_ID}/movements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "IN", quantity: 3 }),
      }),
      routeContext,
    );
    const { status, body } = await parseResponse<{
      movement: { type: string };
      stock: { physical: string };
    }>(res);

    expect(status).toBe(201);
    expect(body.movement.type).toBe("IN");
    expect(body.stock.physical).toBe("3");
    expect(recordMovement).toHaveBeenCalledWith(
      expect.objectContaining({
        materialId: MATERIAL_ID,
        type: "IN",
        quantity: 3,
        userId: "user-test-1",
      }),
    );
  });
});
