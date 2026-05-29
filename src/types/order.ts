import type { OrderStatus } from "@/types/order-status";

export type OrderParams = Record<string, unknown>;

export type OrderMaterialLineDto = {
  id: string;
  materialId: string;
  plannedQty: string;
  actualQty: string | null;
  unitCostSnapshot: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderShortageItemDto = {
  materialId: string;
  plannedQty: string;
  availableAtApproval: string;
  missingQty: string;
};

export type OrderAssignedWorkerDto = {
  id: string;
  email: string;
  name: string | null;
};

export type OrderDto = {
  id: string;
  clientId: string;
  status: OrderStatus;
  furnitureType: string;
  params: OrderParams;
  notes: string | null;
  hasShortages: boolean;
  shortages: OrderShortageItemDto[] | null;
  laborAmount: string | null;
  materialLines: OrderMaterialLineDto[];
  assignedWorkers: OrderAssignedWorkerDto[];
  materialsSubtotal: string;
  totalAmount: string;
  createdAt: string;
  updatedAt: string;
};

export type AssignOrderWorkersPayload = {
  workerIds: string[];
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
  laborAmount: number;
}>;

export type UpsertOrderMaterialLinePayload = {
  materialId: string;
  plannedQty: number;
};

export type SetOrderMaterialLinesPayload = {
  lines: UpsertOrderMaterialLinePayload[];
};

export type ConfirmOrderActualConsumptionPayload = {
  lines: {
    materialId: string;
    actualQty: number;
  }[];
};
