import { db } from "@/lib/db";
import {
  releaseReservationsOnCancel,
  reservePlannedMaterialsOnApproval,
} from "@/lib/order-reservations";
import { parseOrderTransition } from "@/lib/validators/order";
import type { UserRole } from "@/types/user-role";

export class OrderWorkflowError extends Error {
  constructor(
    public code: "ORDER_NOT_FOUND" | "INVALID_TRANSITION",
    message: string,
  ) {
    super(message);
    this.name = "OrderWorkflowError";
  }
}

export async function approveOrder(
  orderId: string,
  role: UserRole,
  userId?: string,
) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true },
  });

  if (!order) {
    throw new OrderWorkflowError("ORDER_NOT_FOUND", "Pedido no encontrado");
  }

  const transition = parseOrderTransition(
    order.status,
    { status: "APPROVED" },
    role,
  );
  if (!transition.success) {
    throw new OrderWorkflowError(
      "INVALID_TRANSITION",
      "Transición no permitida para aprobar pedido",
    );
  }

  await db.order.update({
    where: { id: orderId },
    data: { status: "APPROVED" },
  });

  const reservationResult = await reservePlannedMaterialsOnApproval(orderId, userId);

  return {
    orderId,
    status: "APPROVED" as const,
    ...reservationResult,
  };
}

export async function cancelOrder(orderId: string, role: UserRole, userId?: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true },
  });

  if (!order) {
    throw new OrderWorkflowError("ORDER_NOT_FOUND", "Pedido no encontrado");
  }

  const transition = parseOrderTransition(
    order.status,
    { status: "CANCELLED" },
    role,
  );
  if (!transition.success) {
    throw new OrderWorkflowError(
      "INVALID_TRANSITION",
      "Transición no permitida para cancelar pedido",
    );
  }

  const releaseResult = await releaseReservationsOnCancel(orderId, userId);

  await db.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });

  return {
    orderId,
    status: "CANCELLED" as const,
    ...releaseResult,
  };
}
