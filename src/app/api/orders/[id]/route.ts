import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";

import { requireRole } from "@/lib/api-auth";
import {
  type IdRouteContext,
  parseJsonBody,
  resolveRouteParams,
  validationErrorResponse,
} from "@/lib/api-route-utils";
import { db } from "@/lib/db";
import { denyIfOrderAccessDenied } from "@/lib/order-access";
import { orderDetailInclude } from "@/lib/order-queries";
import { serializeOrderFromDetail } from "@/lib/serializers/order";
import { setLaborAmountSchema, updateOrderDraftSchema } from "@/lib/validators/order";
import { UserRole } from "@/types/user-role";

export async function GET(_request: Request, { params }: IdRouteContext) {
  const auth = await requireRole(UserRole.ADMIN, UserRole.WORKER, UserRole.CLIENT);
  if (!auth.ok) return auth.response;
  const audience = auth.session.user.role === UserRole.CLIENT ? "client" : "internal";

  const { id } = await resolveRouteParams(params);

  const order = await db.order.findUnique({
    where: { id },
    include: orderDetailInclude,
  });
  if (!order) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const denied = await denyIfOrderAccessDenied(
    auth.session.user.role,
    order,
    auth.session.user.id,
  );
  if (denied) return denied;

  return NextResponse.json(serializeOrderFromDetail(order, { audience }), { status: 200 });
}

export async function PATCH(request: Request, { params }: IdRouteContext) {
  const auth = await requireRole(UserRole.ADMIN, UserRole.WORKER, UserRole.CLIENT);
  if (!auth.ok) return auth.response;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const hasLaborAmount =
    body.data &&
    typeof body.data === "object" &&
    "laborAmount" in (body.data as Record<string, unknown>);

  const { id } = await resolveRouteParams(params);

  const order = await db.order.findUnique({
    where: { id },
    select: { id: true, status: true, clientId: true },
  });
  if (!order) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const denied = await denyIfOrderAccessDenied(
    auth.session.user.role,
    order,
    auth.session.user.id,
  );
  if (denied) return denied;

  if (hasLaborAmount) {
    const parsedLabor = setLaborAmountSchema.safeParse(body.data);
    if (!parsedLabor.success) {
      return validationErrorResponse(parsedLabor.error);
    }

    const role = auth.session.user.role;
    const isWorkshop = role === UserRole.ADMIN || role === UserRole.WORKER;
    if (!isWorkshop) {
      return NextResponse.json(
        { error: "No autorizado para fijar mano de obra" },
        { status: 403 },
      );
    }

    if (order.status !== "READY" && order.status !== "DELIVERED") {
      return NextResponse.json(
        { error: "La mano de obra solo se puede editar en READY o DELIVERED" },
        { status: 409 },
      );
    }

    const updated = await db.order.update({
      where: { id },
      data: { laborAmount: parsedLabor.data.laborAmount },
      include: orderDetailInclude,
    });

    return NextResponse.json(serializeOrderFromDetail(updated), { status: 200 });
  }

  const parsed = updateOrderDraftSchema.safeParse(body.data);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const isClient = auth.session.user.role === UserRole.CLIENT;
  if (isClient && order.status !== "DRAFT") {
    return NextResponse.json(
      { error: "Solo puedes editar pedidos propios en borrador" },
      { status: 403 },
    );
  }

  const updateData: Prisma.OrderUpdateInput = {};
  if (parsed.data.furnitureType !== undefined) {
    updateData.furnitureType = parsed.data.furnitureType;
  }
  if (parsed.data.params !== undefined) {
    updateData.parameters = parsed.data.params as Prisma.InputJsonValue;
  }
  if (parsed.data.notes !== undefined) {
    updateData.notes = parsed.data.notes;
  }

  const updated = await db.order.update({
    where: { id },
    data: updateData,
    include: orderDetailInclude,
  });

  return NextResponse.json(serializeOrderFromDetail(updated), { status: 200 });
}
