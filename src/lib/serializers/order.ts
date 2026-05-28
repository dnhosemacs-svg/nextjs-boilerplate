import type { OrderDto } from "@/types/order";

type DecimalLike = { toString(): string };
type SerializeAudience = "internal" | "client";
type SerializeOrderOptions = { audience?: SerializeAudience };

type OrderWithSerializableFields = {
  id: string;
  clientId: string;
  status: OrderDto["status"];
  furnitureType: string;
  parameters: unknown;
  notes: string | null;
  hasShortages: boolean;
  shortages: OrderDto["shortages"];
  laborAmount: DecimalLike | null;
  materialLines?: Array<{
    id: string;
    materialId: string;
    plannedQty: DecimalLike;
    actualQty: DecimalLike | null;
    unitCostSnapshot: DecimalLike;
    createdAt: Date;
    updatedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
};

function toNumber(value: DecimalLike): number {
  return Number(value.toString());
}

export function serializeOrder(
  order: OrderWithSerializableFields,
  options?: SerializeOrderOptions,
): OrderDto {
  const audience = options?.audience ?? "internal";
  const isClientAudience = audience === "client";
  const materialLines = (order.materialLines ?? []).map((line) => ({
    id: line.id,
    materialId: line.materialId,
    plannedQty: line.plannedQty.toString(),
    actualQty: line.actualQty?.toString() ?? null,
    unitCostSnapshot: line.unitCostSnapshot.toString(),
    createdAt: line.createdAt.toISOString(),
    updatedAt: line.updatedAt.toISOString(),
  }));

  const materialsSubtotal = (order.materialLines ?? [])
    .reduce((acc, line) => acc + toNumber(line.plannedQty) * toNumber(line.unitCostSnapshot), 0)
    .toFixed(2);

  return {
    id: order.id,
    clientId: order.clientId,
    status: order.status,
    furnitureType: order.furnitureType,
    params:
      order.parameters && typeof order.parameters === "object"
        ? (order.parameters as Record<string, unknown>)
        : {},
    notes: order.notes,
    hasShortages: isClientAudience ? false : order.hasShortages,
    shortages: isClientAudience ? null : order.shortages,
    laborAmount: order.laborAmount?.toString() ?? null,
    materialLines: isClientAudience ? [] : materialLines,
    materialsSubtotal,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}
