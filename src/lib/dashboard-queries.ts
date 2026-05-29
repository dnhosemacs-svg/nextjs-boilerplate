import { db } from "@/lib/db";
import { serializeMaterial } from "@/lib/serializers/material";
import { getMaterialStock } from "@/lib/stock-service";
import type { Material } from "@/types/inventory";

export type LowStockMaterialDto = {
  material: Material;
  available: string;
  minStock: string;
};

export async function listLowStockMaterials(): Promise<LowStockMaterialDto[]> {
  const materials = await db.material.findMany({
    include: { category: true },
    orderBy: { name: "asc" },
  });

  const result: LowStockMaterialDto[] = [];

  for (const material of materials) {
    const stock = await getMaterialStock(material.id);
    const available = Number(stock.available);
    const min = Number(material.minStock);

    if (available < min) {
      result.push({
        material: serializeMaterial(material) as unknown as Material,
        available: stock.available,
        minStock: material.minStock.toString(),
      });
    }
  }

  return result;
}
