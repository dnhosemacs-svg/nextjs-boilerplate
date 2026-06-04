import { describe, it, expect } from "vitest";
import { createCategorySchema, updateCategorySchema } from "@/lib/validators/category";

describe("createCategorySchema", () => {
  it("acepta y recorta un nombre válido", () => {
    const result = createCategorySchema.safeParse({ name: "  Madera  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Madera");
    }
  });

  it("rechaza nombre vacío tras trim", () => {
    const result = createCategorySchema.safeParse({ name: "   " });
    expect(result.success).toBe(false);
  });

  it("rechaza nombre demasiado largo", () => {
    const result = createCategorySchema.safeParse({ name: "a".repeat(121) });
    expect(result.success).toBe(false);
  });
});

describe("updateCategorySchema", () => {
  it("rechaza objeto vacío", () => {
    const result = updateCategorySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("acepta actualizar solo el nombre", () => {
    const result = updateCategorySchema.safeParse({ name: "Herrajes" });
    expect(result.success).toBe(true);
  });
});
