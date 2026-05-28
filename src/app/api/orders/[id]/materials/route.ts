import { NextResponse } from "next/server";

import { requireRole } from "@/lib/api-auth";
import {
  type IdRouteContext,
  parseJsonBody,
  resolveRouteParams,
  validationErrorResponse,
} from "@/lib/api-route-utils";
import { db } from "@/lib/db";
import { serializeOrder } from "@/lib/serializers/order";
import {
  ORDER_EDITABLE_FIELDS_BY_STATUS,
  setOrderMaterialLinesSchema,
} from "@/lib/validators/order";
import { UserRole } from "@/types/user-role";

export async function PUT(request: Request, { params }: IdRouteContext) {
  const auth = await requireRole(UserRole.ADMIN, UserRole.WORKER);
  if (!auth.ok) return auth.response;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = setOrderMaterialLinesSchema.safeParse(body.data);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { id } = await resolveRouteParams(params);

  const order = await db.order.findUnique({
    where: { id },
    select: { id: true, status: true },
  });
  if (!order) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (!ORDER_EDITABLE_FIELDS_BY_STATUS[order.status].includes("lines")) {
    return NextResponse.json(
      { error: `No puedes editar líneas en estado ${order.status}` },
      { status: 400 },
    );
  }

  const materialIds = parsed.data.lines.map((line) => line.materialId);
  const materials = await db.material.findMany({
    where: { id: { in: materialIds } },
    select: { id: true, unitCost: true },
  });

  if (materials.length !== materialIds.length) {
    const found = new Set(materials.map((material) => material.id));
    const missing = materialIds.filter((idValue) => !found.has(idValue));
    return NextResponse.json(
      { error: "Materiales no encontrados", missingMaterialIds: missing },
      { status: 400 },
    );
  }

  const materialById = new Map(materials.map((material) => [material.id, material]));

  const updatedOrder = await db.$transaction(async (tx) => {
    await tx.orderMaterialLine.deleteMany({ where: { orderId: id } });

    await tx.orderMaterialLine.createMany({
      data: parsed.data.lines.map((line) => ({
        orderId: id,
        materialId: line.materialId,
        plannedQty: line.plannedQty,
        unitCostSnapshot: materialById.get(line.materialId)!.unitCost,
      })),
    });

    return tx.order.findUnique({
      where: { id },
      include: {
        materialLines: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  });

  if (!updatedOrder) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(serializeOrder(updatedOrder), { status: 200 });
}
