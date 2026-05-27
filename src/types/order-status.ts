export const OrderStatus = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  IN_PRODUCTION: "IN_PRODUCTION",
  READY: "READY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const ORDER_STATUSES = [
  OrderStatus.DRAFT,
  OrderStatus.PENDING,
  OrderStatus.APPROVED,
  OrderStatus.IN_PRODUCTION,
  OrderStatus.READY,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
] as const;

export function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    (ORDER_STATUSES as readonly string[]).includes(value)
  );
}
