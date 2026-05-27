import type { OrderStatus } from "@/types/order-status";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  DRAFT: "Borrador",
  PENDING: "Pendiente de revisión",
  APPROVED: "Aprobado",
  IN_PRODUCTION: "En producción",
  READY: "Listo",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export const ORDER_STATUS_OPTIONS = (
  Object.entries(ORDER_STATUS_LABEL) as [OrderStatus, string][]
).map(([value, label]) => ({ value, label }));

export function formatOrderStatus(status: OrderStatus) {
  return ORDER_STATUS_LABEL[status];
}

/** Estados finales: no se editan ni transicionan desde la UI estándar */
export const ORDER_TERMINAL_STATUSES: OrderStatus[] = [
  "DELIVERED",
  "CANCELLED",
];
