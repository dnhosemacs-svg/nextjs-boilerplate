import { describe, it, expect } from "vitest";

import { materialListQuerySchema } from "@/lib/validators/material";

describe("materialListQuerySchema", () => {
  it("recorta search y categoryId vacíos a undefined", () => {
    const result = materialListQuerySchema.safeParse({
      search: "   ",
      categoryId: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBeUndefined();
      expect(result.data.categoryId).toBeUndefined();
      expect(result.data.sortBy).toBe("name");
      expect(result.data.sortOrder).toBe("asc");
    }
  });

  it("conserva search y categoryId con contenido", () => {
    const result = materialListQuerySchema.safeParse({
      search: "  tablero ",
      categoryId: "cat-1",
      sortBy: "unitCost",
      sortOrder: "desc",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe("tablero");
      expect(result.data.categoryId).toBe("cat-1");
      expect(result.data.sortBy).toBe("unitCost");
      expect(result.data.sortOrder).toBe("desc");
    }
  });

  it("rechaza sortBy inválido", () => {
    const result = materialListQuerySchema.safeParse({ sortBy: "invalido" });
    expect(result.success).toBe(false);
  });
});
