import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

type OrderShortageItem = {
  materialId: string;
  plannedQty: string;
  availableAtApproval: string;
  missingQty: string;
};

type ReserveOnApprovalResult = {
  hasShortages: boolean;
  shortages: OrderShortageItem[];
  reservedCount: number;
};

function decimalOrZero(value: Prisma.Decimal | null | undefined): Prisma.Decimal {
  return value ?? new Prisma.Decimal(0);
}

async function getMaterialAvailableForReservation(
  tx: Prisma.TransactionClient,
  materialId: string,
): Promise<Prisma.Decimal> {
  const [inSum, outSum, adjustSum, reservedSum] = await Promise.all([
    tx.stockMovement.aggregate({
      where: { materialId, type: "IN" },
      _sum: { quantity: true },
    }),
    tx.stockMovement.aggregate({
      where: { materialId, type: "OUT" },
      _sum: { quantity: true },
    }),
    tx.stockMovement.aggregate({
      where: { materialId, type: "ADJUST" },
      _sum: { quantity: true },
    }),
    tx.orderReservation.aggregate({
      where: { materialId, active: true },
      _sum: { quantity: true },
    }),
  ]);

  const physical = decimalOrZero(inSum._sum.quantity)
    .minus(decimalOrZero(outSum._sum.quantity))
    .plus(decimalOrZero(adjustSum._sum.quantity));
  const reserved = decimalOrZero(reservedSum._sum.quantity);
  return physical.minus(reserved);
}

export async function reservePlannedMaterialsOnApproval(
  orderId: string,
  userId?: string,
): Promise<ReserveOnApprovalResult> {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        materialLines: {
          select: { materialId: true, plannedQty: true },
        },
      },
    });

    if (!order) {
      throw new Error("Pedido no encontrado");
    }

    const shortages: OrderShortageItem[] = [];

    for (const line of order.materialLines) {
      const plannedQty = line.plannedQty;
      const availableAtApproval = await getMaterialAvailableForReservation(
        tx,
        line.materialId,
      );

      if (availableAtApproval.lessThan(plannedQty)) {
        shortages.push({
          materialId: line.materialId,
          plannedQty: plannedQty.toFixed(3),
          availableAtApproval: availableAtApproval.toFixed(3),
          missingQty: plannedQty.minus(availableAtApproval).toFixed(3),
        });
      }

      await tx.orderReservation.create({
        data: {
          orderId,
          materialId: line.materialId,
          quantity: plannedQty,
          active: true,
        },
      });

      await tx.stockMovement.create({
        data: {
          type: "RESERVE",
          quantity: plannedQty,
          reason: "Reserva al aprobar pedido",
          materialId: line.materialId,
          orderId,
          userId: userId ?? null,
        },
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        hasShortages: shortages.length > 0,
        shortages: shortages.length > 0 ? shortages : Prisma.JsonNull,
      },
    });

    return {
      hasShortages: shortages.length > 0,
      shortages,
      reservedCount: order.materialLines.length,
    };
  });
}

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
