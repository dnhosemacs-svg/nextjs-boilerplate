import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  authAs,
  authUnauthorized,
  parseResponse,
  useRequireRoleMock,
} from "@/test/api-auth-mock";
import { API_ERROR_MESSAGES } from "@/lib/api-error";
import { StockServiceError } from "@/lib/stock-service";
import { UserRole } from "@/types/user-role";

const mockRequireRole = vi.hoisted(() => vi.fn());
const mockGetMaterialStock = vi.hoisted(() => vi.fn());

useRequireRoleMock(mockRequireRole);

vi.mock("@/lib/db", () => ({
  db: {},
}));

vi.mock("@/lib/api-auth", () => ({
  API_UNAUTHORIZED_BODY: { error: "No autenticado" },
  API_FORBIDDEN_BODY: { error: "Prohibido" },
  requireRole: mockRequireRole,
}));

vi.mock("@/lib/stock-service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/stock-service")>();
  return {
    ...actual,
    getMaterialStock: mockGetMaterialStock,
  };
});

import { GET } from "./route";

const MATERIAL_ID = "mat-abc-123";

describe("GET /api/materials/[id]/stock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authAs(UserRole.WORKER);
  });

  it("devuelve 401 sin sesión", async () => {
    authUnauthorized();

    const res = await GET(
      new Request(`http://localhost/api/materials/${MATERIAL_ID}/stock`),
      { params: Promise.resolve({ id: MATERIAL_ID }) },
    );
    const { status, body } = await parseResponse(res);

    expect(status).toBe(401);
    expect(body).toEqual({ error: "No autenticado" });
    expect(mockGetMaterialStock).not.toHaveBeenCalled();
  });

  it("devuelve snapshot físico / reservado / disponible", async () => {
    mockGetMaterialStock.mockResolvedValue({
      physical: "8.000",
      reserved: "2.000",
      available: "6.000",
    });

    const res = await GET(
      new Request(`http://localhost/api/materials/${MATERIAL_ID}/stock`),
      { params: Promise.resolve({ id: MATERIAL_ID }) },
    );
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body).toEqual({
      physical: "8.000",
      reserved: "2.000",
      available: "6.000",
    });
    expect(mockGetMaterialStock).toHaveBeenCalledWith(MATERIAL_ID);
  });

  it("devuelve 404 si el material no existe", async () => {
    mockGetMaterialStock.mockRejectedValue(
      new StockServiceError("MATERIAL_NOT_FOUND", "No encontrado"),
    );

    const res = await GET(
      new Request(`http://localhost/api/materials/${MATERIAL_ID}/stock`),
      { params: Promise.resolve({ id: MATERIAL_ID }) },
    );
    const { status, body } = await parseResponse(res);

    expect(status).toBe(404);
    expect(body).toEqual({ error: API_ERROR_MESSAGES.NOT_FOUND });
  });
});
