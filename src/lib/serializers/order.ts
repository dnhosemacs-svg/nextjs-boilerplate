import type { OrderWithDetailInclude } from "@/lib/order-queries";
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
  shortages: OrderDto["shortages"] | unknown;
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
  workerAssignments?: Array<{
    worker: { id: string; email: string; name: string | null };
  }>;
  createdAt: Date;
  updatedAt: Date;
};

function toNumber(value: DecimalLike): number {
  return Number(value.toString());
}

function mapAssignedWorkers(
  assignments: OrderWithSerializableFields["workerAssignments"],
): OrderDto["assignedWorkers"] {
  return (assignments ?? []).map((row) => ({
    id: row.worker.id,
    email: row.worker.email,
    name: row.worker.name,
  }));
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

  const materialsSubtotalNumber = (order.materialLines ?? []).reduce(
    (acc, line) => acc + toNumber(line.plannedQty) * toNumber(line.unitCostSnapshot),
    0,
  );
  const laborAmountNumber = order.laborAmount ? toNumber(order.laborAmount) : 0;
  const materialsSubtotal = materialsSubtotalNumber.toFixed(2);
  const totalAmount = (materialsSubtotalNumber + laborAmountNumber).toFixed(2);

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
    shortages: isClientAudience
      ? null
      : (order.shortages as OrderDto["shortages"] | null),
    laborAmount: order.laborAmount?.toString() ?? null,
    materialLines: isClientAudience ? [] : materialLines,
    assignedWorkers: isClientAudience ? [] : mapAssignedWorkers(order.workerAssignments),
    materialsSubtotal,
    totalAmount,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export function serializeOrderFromDetail(
  order: OrderWithDetailInclude,
  options?: SerializeOrderOptions,
): OrderDto {
  return serializeOrder(order, options);
}
