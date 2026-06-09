import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  authAs,
  authUnauthorized,
  parseResponse,
  useRequireRoleMock,
} from "@/test/api-auth-mock";
import { UserRole } from "@/types/user-role";

const mockRequireRole = vi.hoisted(() => vi.fn());
const listLowStockMaterials = vi.hoisted(() => vi.fn());

useRequireRoleMock(mockRequireRole);

vi.mock("@/lib/api-auth", () => ({
  API_UNAUTHORIZED_BODY: { error: "No autenticado" },
  API_FORBIDDEN_BODY: { error: "Prohibido" },
  requireRole: mockRequireRole,
}));

vi.mock("@/lib/dashboard-queries", () => ({
  listLowStockMaterials,
}));

import { GET } from "./route";

describe("GET /api/materials/low-stock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authAs(UserRole.WORKER);
  });

  it("devuelve 401 sin sesión", async () => {
    authUnauthorized();

    const res = await GET();
    expect((await parseResponse(res)).status).toBe(401);
    expect(listLowStockMaterials).not.toHaveBeenCalled();
  });

  it("devuelve 200 con materiales bajo mínimo", async () => {
    listLowStockMaterials.mockResolvedValue([
      { id: "mat-1", name: "Clavos", stock: "1", minStock: "5" },
    ]);

    const res = await GET();
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body).toEqual([
      { id: "mat-1", name: "Clavos", stock: "1", minStock: "5" },
    ]);
  });
});
