import type { OrderDto } from "@/types/order";
import { OrderStatus } from "@/types/order-status";

const PENDING_STATUSES = new Set<string>([OrderStatus.DRAFT, OrderStatus.PENDING]);
const IN_PROGRESS_STATUSES = new Set<string>([
  OrderStatus.APPROVED,
  OrderStatus.IN_PRODUCTION,
  OrderStatus.READY,
]);

export type OrderDashboardStats = {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  completionRate: number;
};

export function computeOrderDashboardStats(orders: OrderDto[]): OrderDashboardStats {
  const total = orders.length;
  const pending = orders.filter((o) => PENDING_STATUSES.has(o.status)).length;
  const inProgress = orders.filter((o) => IN_PROGRESS_STATUSES.has(o.status)).length;
  const completed = orders.filter((o) => o.status === OrderStatus.DELIVERED).length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, pending, inProgress, completed, completionRate };
}
