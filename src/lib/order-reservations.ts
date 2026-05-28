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

type ReleaseOnCancelResult = {
  releasedCount: number;
};

type ConsumeActualLineInput = {
  materialId: string;
  actualQty: number;
};

type ActualOverrunWarning = {
  materialId: string;
  plannedQty: string;
  actualQty: string;
  excessQty: string;
};

type ConsumeRealOnProductionResult = {
  consumedCount: number;
  releasedCount: number;
  warnings: ActualOverrunWarning[];
};

export class OrderConsumptionError extends Error {
  constructor(
    public code:
      | "ORDER_NOT_FOUND"
      | "INVALID_STATUS"
      | "MATERIAL_LINES_MISMATCH"
      | "INVALID_ACTUAL_QTY",
    message: string,
  ) {
    super(message);
    this.name = "OrderConsumptionError";
  }
}

function decimalOrZero(value: Prisma.Decimal | null | undefined): Prisma.Decimal {
  return value ?? new Prisma.Decimal(0);
}

async function recomputeAndPersistMaterialPhysicalStock(
  tx: Prisma.TransactionClient,
  materialId: string,
) {
  const [inSum, outSum, adjustSum] = await Promise.all([
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
  ]);

  const physical = decimalOrZero(inSum._sum.quantity)
    .minus(decimalOrZero(outSum._sum.quantity))
    .plus(decimalOrZero(adjustSum._sum.quantity));

  await tx.material.update({
    where: { id: materialId },
    data: { stock: physical },
  });
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
 * Al cancelar un pedido: crea movimientos RELEASE y desactiva reservas activas.
 */
export async function releaseReservationsOnCancel(
  orderId: string,
  userId?: string,
): Promise<ReleaseOnCancelResult> {
  return db.$transaction(async (tx) => {
    const activeReservations = await tx.orderReservation.findMany({
      where: { orderId, active: true },
      select: { materialId: true, quantity: true },
    });

    for (const reservation of activeReservations) {
      await tx.stockMovement.create({
        data: {
          type: "RELEASE",
          quantity: reservation.quantity,
          reason: "Liberación al cancelar pedido",
          materialId: reservation.materialId,
          orderId,
          userId: userId ?? null,
        },
      });
    }

    await tx.orderReservation.updateMany({
      where: { orderId, active: true },
      data: { active: false },
    });

    return { releasedCount: activeReservations.length };
  });
}

/**
 * Compatibilidad con código existente.
 * Delega en la implementación completa de liberación al cancelar.
 */
export async function markReservationsForRelease(orderId: string) {
  return releaseReservationsOnCancel(orderId);
}

/**
 * En IN_PRODUCTION: registra consumo real por línea (OUT),
 * libera reservas asociadas (RELEASE) y cierra reservas activas.
 */
export async function consumeRealMaterialsInProduction(
  orderId: string,
  lines: ConsumeActualLineInput[],
  userId?: string,
): Promise<ConsumeRealOnProductionResult> {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        materialLines: {
          select: { materialId: true, plannedQty: true },
        },
      },
    });

    if (!order) {
      throw new OrderConsumptionError("ORDER_NOT_FOUND", "Pedido no encontrado");
    }
    if (order.status !== "IN_PRODUCTION") {
      throw new OrderConsumptionError(
        "INVALID_STATUS",
        "Solo se puede confirmar consumo real en IN_PRODUCTION",
      );
    }

    const orderMaterialIds = new Set(order.materialLines.map((line) => line.materialId));
    const requestMaterialIds = new Set(lines.map((line) => line.materialId));

    if (orderMaterialIds.size !== requestMaterialIds.size) {
      throw new OrderConsumptionError(
        "MATERIAL_LINES_MISMATCH",
        "Debes enviar consumo real para todas las líneas planificadas del pedido",
      );
    }
    for (const materialId of orderMaterialIds) {
      if (!requestMaterialIds.has(materialId)) {
        throw new OrderConsumptionError(
          "MATERIAL_LINES_MISMATCH",
          "Las líneas reales no coinciden con las líneas planificadas del pedido",
        );
      }
    }

    const activeReservations = await tx.orderReservation.findMany({
      where: { orderId, active: true },
      select: { materialId: true, quantity: true },
    });
    const reservationByMaterial = new Map<string, Prisma.Decimal>();
    for (const reservation of activeReservations) {
      const current = reservationByMaterial.get(reservation.materialId) ?? new Prisma.Decimal(0);
      reservationByMaterial.set(reservation.materialId, current.plus(reservation.quantity));
    }

    const plannedByMaterial = new Map<string, Prisma.Decimal>(
      order.materialLines.map((line) => [line.materialId, line.plannedQty]),
    );

    const warnings: ActualOverrunWarning[] = [];
    const touchedMaterialIds = new Set<string>();

    for (const line of lines) {
      const actualQty = new Prisma.Decimal(line.actualQty);
      if (!actualQty.greaterThan(0)) {
        throw new OrderConsumptionError(
          "INVALID_ACTUAL_QTY",
          "La cantidad real debe ser mayor que cero",
        );
      }

      const plannedQty = plannedByMaterial.get(line.materialId);
      if (!plannedQty) {
        throw new OrderConsumptionError(
          "MATERIAL_LINES_MISMATCH",
          "Las líneas reales no coinciden con las líneas planificadas del pedido",
        );
      }

      if (actualQty.greaterThan(plannedQty)) {
        const excessQty = actualQty.minus(plannedQty);
        warnings.push({
          materialId: line.materialId,
          plannedQty: plannedQty.toFixed(3),
          actualQty: actualQty.toFixed(3),
          excessQty: excessQty.toFixed(3),
        });
        console.warn("[orders.consume-real.overrun]", {
          orderId,
          materialId: line.materialId,
          plannedQty: plannedQty.toFixed(3),
          actualQty: actualQty.toFixed(3),
          excessQty: excessQty.toFixed(3),
        });
      }

      await tx.orderMaterialLine.updateMany({
        where: { orderId, materialId: line.materialId },
        data: { actualQty },
      });

      await tx.stockMovement.create({
        data: {
          type: "OUT",
          quantity: actualQty,
          reason: actualQty.greaterThan(plannedQty)
            ? "Consumo real en producción (exceso sobre plan)"
            : "Consumo real en producción",
          materialId: line.materialId,
          orderId,
          userId: userId ?? null,
        },
      });

      const reservedQty = reservationByMaterial.get(line.materialId) ?? new Prisma.Decimal(0);
      if (reservedQty.greaterThan(0)) {
        await tx.stockMovement.create({
          data: {
            type: "RELEASE",
            quantity: reservedQty,
            reason: "Liberación de reserva por consumo real",
            materialId: line.materialId,
            orderId,
            userId: userId ?? null,
          },
        });
      }

      touchedMaterialIds.add(line.materialId);
    }

    await tx.orderReservation.updateMany({
      where: { orderId, active: true },
      data: { active: false },
    });

    for (const materialId of touchedMaterialIds) {
      await recomputeAndPersistMaterialPhysicalStock(tx, materialId);
    }

    return {
      consumedCount: lines.length,
      releasedCount: activeReservations.length,
      warnings,
    };
  });
}
