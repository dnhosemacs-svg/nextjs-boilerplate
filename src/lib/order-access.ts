import { NextResponse } from "next/server";

import type { Prisma } from "@/generated/prisma/client";
import { isWorkerAssignedToOrder } from "@/lib/order-assignments";
import type { UserRole } from "@/types/user-role";
import { UserRole as R } from "@/types/user-role";

/** CLIENT solo puede operar pedidos donde es el titular (`clientId`). */
export function denyIfClientNotOrderOwner(
  role: UserRole,
  orderClientId: string,
  sessionUserId: string,
): NextResponse | null {
  if (role === R.CLIENT && orderClientId !== sessionUserId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  return null;
}

/** WORKER solo puede operar pedidos donde está asignado. */
export async function denyIfWorkerNotAssigned(
  role: UserRole,
  orderId: string,
  sessionUserId: string,
): Promise<NextResponse | null> {
  if (role !== R.WORKER) return null;

  const assigned = await isWorkerAssignedToOrder(orderId, sessionUserId);
  if (!assigned) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  return null;
}

export function buildOrderListWhere(input: {
  role: UserRole;
  sessionUserId: string;
  status?: string | null;
  furnitureType?: string | null;
  clientId?: string | null;
  hasShortages?: boolean;
  unassigned?: boolean;
}): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {};

  if (input.status) {
    where.status = input.status as Prisma.EnumOrderStatusFilter["equals"];
  }
  if (input.furnitureType) {
    where.furnitureType = input.furnitureType;
  }
  if (input.hasShortages) {
    where.hasShortages = true;
  }

  if (input.role === R.CLIENT) {
    where.clientId = input.sessionUserId;
  } else if (input.clientId) {
    where.clientId = input.clientId;
  }

  if (input.role === R.WORKER) {
    where.workerAssignments = { some: { workerId: input.sessionUserId } };
  } else if (input.unassigned) {
    where.workerAssignments = { none: {} };
  }

  return where;
}

/** Comprueba titular (CLIENT) y asignación (WORKER) en rutas por id de pedido. */
export async function denyIfOrderAccessDenied(
  role: UserRole,
  order: { id: string; clientId: string },
  sessionUserId: string,
): Promise<NextResponse | null> {
  const clientDenied = denyIfClientNotOrderOwner(role, order.clientId, sessionUserId);
  if (clientDenied) return clientDenied;
  return denyIfWorkerNotAssigned(role, order.id, sessionUserId);
}
