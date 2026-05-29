export type MaterialStockSnapshot = {
  physical: string;
  reserved: string;
  available: string;
};

export type RecordMovementInput = {
  materialId: string;
  type: "IN" | "OUT" | "ADJUST" | "RESERVE" | "RELEASE";
  quantity: number;
  reason?: string;
  orderId?: string;
  userId?: string;
};

export type OrderStockMovementDto = {
  id: string;
  type: "IN" | "OUT" | "ADJUST" | "RESERVE" | "RELEASE";
  quantity: string;
  reason: string | null;
  materialId: string;
  materialName: string;
  orderId: string | null;
  userId: string | null;
  createdAt: string;
};
