type MaterialWithDecimals = {
  unitCost: { toString(): string };
  stock: { toString(): string };
  minStock: { toString(): string };
};

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date(0).toISOString();
}

export function serializeMaterial<T extends MaterialWithDecimals>(
  material: T,
): Omit<T, "unitCost" | "stock" | "minStock"> & {
  unitCost: string;
  stock: string;
  minStock: string;
} {
  const category =
    material &&
    typeof material === "object" &&
    "category" in material &&
    (material as { category?: unknown }).category &&
    typeof (material as { category?: unknown }).category === "object"
      ? (material as { category: Record<string, unknown> }).category
      : null;

  return {
    ...material,
    ...(category
      ? {
          category: {
            ...category,
            ...(category.createdAt ? { createdAt: toIso(category.createdAt) } : {}),
            ...(category.updatedAt ? { updatedAt: toIso(category.updatedAt) } : {}),
          },
        }
      : {}),
    ...(("createdAt" in (material as object) && (material as { createdAt?: unknown }).createdAt)
      ? { createdAt: toIso((material as { createdAt?: unknown }).createdAt) }
      : {}),
    ...(("updatedAt" in (material as object) && (material as { updatedAt?: unknown }).updatedAt)
      ? { updatedAt: toIso((material as { updatedAt?: unknown }).updatedAt) }
      : {}),
    unitCost: material.unitCost.toString(),
    stock: material.stock.toString(),
    minStock: material.minStock.toString(),
  };
}
