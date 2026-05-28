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
import { updateOrderDraftSchema } from "@/lib/validators/order";
import { UserRole } from "@/types/user-role";

export async function GET(_request: Request, { params }: IdRouteContext) {
  const auth = await requireRole(UserRole.ADMIN, UserRole.WORKER, UserRole.CLIENT);
  if (!auth.ok) return auth.response;

  const { id } = await resolveRouteParams(params);

  const order = await db.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const isClient = auth.session.user.role === UserRole.CLIENT;
  if (isClient && order.clientId !== auth.session.user.id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(serializeOrder(order), { status: 200 });
}

export async function PATCH(request: Request, { params }: IdRouteContext) {
  const auth = await requireRole(UserRole.ADMIN, UserRole.WORKER, UserRole.CLIENT);
  if (!auth.ok) return auth.response;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = updateOrderDraftSchema.safeParse(body.data);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { id } = await resolveRouteParams(params);
  const order = await db.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const isClient = auth.session.user.role === UserRole.CLIENT;
  if (isClient && order.clientId !== auth.session.user.id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  if (isClient && order.status !== "DRAFT") {
    return NextResponse.json(
      { error: "Solo puedes editar pedidos propios en borrador" },
      { status: 403 },
    );
  }

  const updated = await db.order.update({
    where: { id },
    data: {
      furnitureType: parsed.data.furnitureType,
      parameters: parsed.data.params,
      notes: parsed.data.notes,
    },
  });

  return NextResponse.json(serializeOrder(updated), { status: 200 });
}
