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
const deleteCategory = vi.hoisted(() => vi.fn());

bindRequireRoleMock(mockRequireRole);

vi.mock("@/lib/api-auth", () => ({
  API_UNAUTHORIZED_BODY: { error: "No autenticado" },
  API_FORBIDDEN_BODY: { error: "Prohibido" },
  requireRole: mockRequireRole,
}));

vi.mock("@/lib/db", () => ({
  db: {
    category: { findUnique, update, delete: deleteCategory },
  },
}));

import { PATCH, DELETE } from "./route";

const CATEGORY_ID = "cat-abc-123";
const routeContext = { params: Promise.resolve({ id: CATEGORY_ID }) };

describe("PATCH /api/categories/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve 403 con rol WORKER", async () => {
    authForbidden();

    const res = await PATCH(
      new Request(`http://localhost/api/categories/${CATEGORY_ID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Nueva" }),
      }),
      routeContext,
    );

    expect((await parseResponse(res)).status).toBe(403);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("devuelve 200 con ADMIN y nombre válido", async () => {
    authAs(UserRole.ADMIN);
    findUnique.mockResolvedValue({ id: CATEGORY_ID, name: "Madera" });
    update.mockResolvedValue({ id: CATEGORY_ID, name: "Maderas" });

    const res = await PATCH(
      new Request(`http://localhost/api/categories/${CATEGORY_ID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Maderas" }),
      }),
      routeContext,
    );
    const { status, body } = await parseResponse<{ name: string }>(res);

    expect(status).toBe(200);
    expect(body.name).toBe("Maderas");
  });

  it("devuelve 404 si la categoría no existe", async () => {
    authAs(UserRole.ADMIN);
    findUnique.mockResolvedValue(null);

    const res = await PATCH(
      new Request(`http://localhost/api/categories/${CATEGORY_ID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Nueva" }),
      }),
      routeContext,
    );

    expect((await parseResponse(res)).status).toBe(404);
  });
});

describe("DELETE /api/categories/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authAs(UserRole.ADMIN);
  });

  it("devuelve 409 si tiene materiales asociados", async () => {
    findUnique.mockResolvedValue({
      id: CATEGORY_ID,
      name: "Madera",
      _count: { materials: 2 },
    });

    const res = await DELETE(
      new Request(`http://localhost/api/categories/${CATEGORY_ID}`, {
        method: "DELETE",
      }),
      routeContext,
    );
    const { status, body } = await parseResponse<{ error: string }>(res);

    expect(status).toBe(409);
    expect(body.error).toBe(
      "No se puede eliminar la categoría porque tiene materiales asociados",
    );
    expect(deleteCategory).not.toHaveBeenCalled();
  });

  it("devuelve 200 al eliminar categoría vacía", async () => {
    findUnique.mockResolvedValue({
      id: CATEGORY_ID,
      name: "Madera",
      _count: { materials: 0 },
    });
    deleteCategory.mockResolvedValue({ id: CATEGORY_ID, name: "Madera" });

    const res = await DELETE(
      new Request(`http://localhost/api/categories/${CATEGORY_ID}`, {
        method: "DELETE",
      }),
      routeContext,
    );

    expect((await parseResponse(res)).status).toBe(200);
    expect(deleteCategory).toHaveBeenCalledWith({ where: { id: CATEGORY_ID } });
  });
});
