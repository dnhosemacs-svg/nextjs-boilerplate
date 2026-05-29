import { db } from "@/lib/db";
import type { OrderStatus } from "@/types/order-status";

/** Historial de estados para trazabilidad y futuros modelos ML. */
export async function recordOrderStatusEvent(
  orderId: string,
  status: OrderStatus,
  userId?: string | null,
) {
  await db.orderStatusEvent.create({
    data: {
      orderId,
      status,
      userId: userId ?? null,
    },
  });
}
