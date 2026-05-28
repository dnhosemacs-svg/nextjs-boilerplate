import type { OrderStatus } from "@/types/order-status";

export type OrderParams = Record<string, unknown>;

export type OrderDto = {
  id: string;
  clientId: string;
  status: OrderStatus;
  furnitureType: string;
  params: OrderParams;
  notes: string | null;
  hasShortages: boolean;
  shortages: unknown | null;
  laborAmount: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderPayload = {
  furnitureType: string;
  params: OrderParams;
  notes?: string;
  clientId?: string;
};

export type UpdateOrderPayload = Partial<{
  furnitureType: string;
  params: OrderParams;
  notes: string | null;
}>;
