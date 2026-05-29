import { NextResponse } from "next/server";

import { requireRole } from "@/lib/api-auth";
import { type IdRouteContext, resolveRouteParams } from "@/lib/api-route-utils";
import { db } from "@/lib/db";
import { denyIfWorkerNotAssigned } from "@/lib/order-access";
import { UserRole } from "@/types/user-role";

export async function GET(_request: Request, { params }: IdRouteContext) {
  const auth = await requireRole(UserRole.ADMIN, UserRole.WORKER);
  if (!auth.ok) return auth.response;

  const { id } = await resolveRouteParams(params);

  const order = await db.order.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!order) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const denied = await denyIfWorkerNotAssigned(
    auth.session.user.role,
    order.id,
    auth.session.user.id,
  );
  if (denied) return denied;

  const movements = await db.stockMovement.findMany({
    where: { orderId: id },
    orderBy: { createdAt: "desc" },
    include: {
      material: { select: { id: true, name: true } },
    },
    take: 100,
  });

  return NextResponse.json(
    movements.map((movement) => ({
      id: movement.id,
      type: movement.type,
      quantity: movement.quantity.toString(),
      reason: movement.reason,
      materialId: movement.materialId,
      materialName: movement.material.name,
      orderId: movement.orderId,
      userId: movement.userId,
      createdAt: movement.createdAt.toISOString(),
    })),
    { status: 200 },
  );
}
