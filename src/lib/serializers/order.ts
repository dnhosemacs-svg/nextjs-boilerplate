import type { OrderDto } from "@/types/order";

type OrderWithSerializableFields = {
  id: string;
  clientId: string;
  status: OrderDto["status"];
  furnitureType: string;
  parameters: unknown;
  notes: string | null;
  hasShortages: boolean;
  shortages: unknown | null;
  laborAmount: { toString(): string } | null;
  createdAt: Date;
  updatedAt: Date;
};

export function serializeOrder(order: OrderWithSerializableFields): OrderDto {
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
    hasShortages: order.hasShortages,
    shortages: order.shortages,
    laborAmount: order.laborAmount?.toString() ?? null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}
