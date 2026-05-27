export type MaterialStockSnapshot = {
  physical: string;
  reserved: string;
  available: string;
};

export type RecordMovementInput = {
  materialId: string;
  type: "IN" | "OUT" | "ADJUST";
  quantity: number;
  reason?: string;
  orderId?: string;
  userId?: string;
};
