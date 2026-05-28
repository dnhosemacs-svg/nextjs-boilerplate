type MaterialWithDecimals = {
  unitCost: { toString(): string };
  stock: { toString(): string };
  minStock: { toString(): string };
};

export function serializeMaterial<T extends MaterialWithDecimals>(
  material: T,
): Omit<T, "unitCost" | "stock" | "minStock"> & {
  unitCost: string;
  stock: string;
  minStock: string;
} {
  return {
    ...material,
    unitCost: material.unitCost.toString(),
    stock: material.stock.toString(),
    minStock: material.minStock.toString(),
  };
}
