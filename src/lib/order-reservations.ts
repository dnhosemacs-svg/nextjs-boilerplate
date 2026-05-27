import { db } from "@/lib/db";

/**
 * Al cancelar un pedido: desactiva reservas activas (preparación para liberar stock).
 * Tarjeta 2.2: añadir movimientos StockMovement RELEASE y recalcular disponible.
 */
export async function markReservationsForRelease(orderId: string) {
  return db.orderReservation.updateMany({
    where: { orderId, active: true },
    data: { active: false },
  });
}
