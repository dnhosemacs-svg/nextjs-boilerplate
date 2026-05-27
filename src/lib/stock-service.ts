import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import type { MaterialStockSnapshot, RecordMovementInput } from "@/types/stock";

type StockDbClient = Pick<
  typeof db,
  "material" | "stockMovement" | "order" | "orderReservation"
>;

type DecimalStockSnapshot = {
  physical: Prisma.Decimal;
  reserved: Prisma.Decimal;
  available: Prisma.Decimal;
};

export class StockServiceError extends Error {
  constructor(
    public code:
      | "MATERIAL_NOT_FOUND"
      | "ORDER_NOT_FOUND"
      | "INSUFFICIENT_AVAILABLE"
      | "INVALID_MOVEMENT"
      | "REASON_REQUIRED",
    message: string,
  ) {
    super(message);
    this.name = "StockServiceError";
  }
}

function decimalOrZero(value: Prisma.Decimal | null | undefined): Prisma.Decimal {
  return value ?? new Prisma.Decimal(0);
}

function toStockSnapshot(stock: DecimalStockSnapshot): MaterialStockSnapshot {
  return {
    physical: stock.physical.toFixed(3),
    reserved: stock.reserved.toFixed(3),
    available: stock.available.toFixed(3),
  };
}

async function computeMaterialStockDecimal(
  client: StockDbClient,
  materialId: string,
): Promise<DecimalStockSnapshot> {
  const [inSum, outSum, adjustSum, reservedSum] = await Promise.all([
    client.stockMovement.aggregate({
      where: { materialId, type: "IN" },
      _sum: { quantity: true },
    }),
    client.stockMovement.aggregate({
      where: { materialId, type: "OUT" },
      _sum: { quantity: true },
    }),
    client.stockMovement.aggregate({
      where: { materialId, type: "ADJUST" },
      _sum: { quantity: true },
    }),
    client.orderReservation.aggregate({
      where: { materialId, active: true },
      _sum: { quantity: true },
    }),
  ]);

  const physical = decimalOrZero(inSum._sum.quantity)
    .minus(decimalOrZero(outSum._sum.quantity))
    .plus(decimalOrZero(adjustSum._sum.quantity));
  const reserved = decimalOrZero(reservedSum._sum.quantity);
  const available = physical.minus(reserved);

  return { physical, reserved, available };
}

export async function getMaterialStock(
  materialId: string,
): Promise<MaterialStockSnapshot> {
  const material = await db.material.findUnique({
    where: { id: materialId },
    select: { id: true },
  });

  if (!material) {
    throw new StockServiceError("MATERIAL_NOT_FOUND", "Material no encontrado");
  }

  const stock = await computeMaterialStockDecimal(db, materialId);
  return toStockSnapshot(stock);
}

export async function recordMovement(input: RecordMovementInput) {
  const type = input.type;

  if (type !== "IN" && type !== "OUT" && type !== "ADJUST") {
    throw new StockServiceError("INVALID_MOVEMENT", "Tipo de movimiento no válido");
  }

  return db.$transaction(async (tx) => {
    const material = await tx.material.findUnique({
      where: { id: input.materialId },
      select: { id: true },
    });

    if (!material) {
      throw new StockServiceError("MATERIAL_NOT_FOUND", "Material no encontrado");
    }

    const quantity = new Prisma.Decimal(input.quantity);

    if (type === "IN") {
      if (!quantity.greaterThan(0)) {
        throw new StockServiceError(
          "INVALID_MOVEMENT",
          "La cantidad de entrada debe ser mayor que cero",
        );
      }
    }

    if (type === "OUT") {
      if (!quantity.greaterThan(0)) {
        throw new StockServiceError(
          "INVALID_MOVEMENT",
          "La cantidad de salida debe ser mayor que cero",
        );
      }
      if (!input.orderId) {
        throw new StockServiceError(
          "INVALID_MOVEMENT",
          "orderId es obligatorio para salidas",
        );
      }

      const order = await tx.order.findUnique({
        where: { id: input.orderId },
        select: { id: true },
      });
      if (!order) {
        throw new StockServiceError("ORDER_NOT_FOUND", "Pedido no encontrado");
      }

      const stockBeforeOut = await computeMaterialStockDecimal(tx, input.materialId);
      if (stockBeforeOut.available.lessThan(quantity)) {
        throw new StockServiceError(
          "INSUFFICIENT_AVAILABLE",
          "Stock disponible insuficiente",
        );
      }
    }

    if (type === "ADJUST") {
      if (quantity.isZero()) {
        throw new StockServiceError(
          "INVALID_MOVEMENT",
          "El ajuste no puede ser cero",
        );
      }

      const reason = input.reason?.trim();
      if (!reason) {
        throw new StockServiceError(
          "REASON_REQUIRED",
          "El motivo es obligatorio en ajustes",
        );
      }

      const stockBeforeAdjust = await computeMaterialStockDecimal(tx, input.materialId);
      const physicalAfterAdjust = stockBeforeAdjust.physical.plus(quantity);
      if (physicalAfterAdjust.lessThan(stockBeforeAdjust.reserved)) {
        throw new StockServiceError(
          "INSUFFICIENT_AVAILABLE",
          "El ajuste dejaría el físico por debajo del reservado",
        );
      }
    }

    const storedQuantity =
      type === "ADJUST" ? quantity : new Prisma.Decimal(Math.abs(input.quantity));

    const movement = await tx.stockMovement.create({
      data: {
        type,
        quantity: storedQuantity,
        reason: input.reason?.trim() || null,
        materialId: input.materialId,
        orderId: type === "OUT" ? (input.orderId ?? null) : null,
        userId: input.userId ?? null,
      },
    });

    const stockAfterMovement = await computeMaterialStockDecimal(tx, input.materialId);

    await tx.material.update({
      where: { id: input.materialId },
      data: { stock: stockAfterMovement.physical },
    });

    return {
      movement,
      stock: toStockSnapshot(stockAfterMovement),
    };
  });
}
