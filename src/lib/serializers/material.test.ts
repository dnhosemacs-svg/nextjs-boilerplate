import { describe, it, expect } from "vitest";

import { serializeMaterial } from "./material";

function decimal(value: string) {
  return { toString: () => value };
}

describe("serializeMaterial", () => {
  it("convierte decimales Prisma a string", () => {
    const result = serializeMaterial({
      id: "mat-1",
      name: "Tablero",
      unitCost: decimal("12.5"),
      stock: decimal("3"),
      minStock: decimal("1"),
    });

    expect(result.unitCost).toBe("12.5");
    expect(result.stock).toBe("3");
    expect(result.minStock).toBe("1");
  });

  it("serializa fechas de categoría y material", () => {
    const createdAt = new Date("2024-06-01T10:00:00.000Z");
    const updatedAt = "2024-06-02T12:00:00.000Z";

    const result = serializeMaterial({
      id: "mat-1",
      name: "Tablero",
      unitCost: decimal("1"),
      stock: decimal("0"),
      minStock: decimal("0"),
      createdAt,
      updatedAt,
      category: {
        id: "cat-1",
        name: "Madera",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt,
      },
    });

    expect(result.createdAt).toBe("2024-06-01T10:00:00.000Z");
    expect(result.updatedAt).toBe("2024-06-02T12:00:00.000Z");
    expect(result.category?.createdAt).toBe("2024-01-01T00:00:00.000Z");
    expect(result.category?.updatedAt).toBe("2024-06-02T12:00:00.000Z");
  });

  it("usa epoch cuando la fecha no es Date ni string", () => {
    const result = serializeMaterial({
      id: "mat-1",
      name: "Tablero",
      unitCost: decimal("1"),
      stock: decimal("0"),
      minStock: decimal("0"),
      createdAt: 12345,
    });

    expect(result.createdAt).toBe(new Date(0).toISOString());
  });
});
