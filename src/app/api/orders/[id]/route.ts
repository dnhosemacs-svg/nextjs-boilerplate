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
import { setLaborAmountSchema, updateOrderDraftSchema } from "@/lib/validators/order";
import { UserRole } from "@/types/user-role";

export async function GET(_request: Request, { params }: IdRouteContext) {
  const auth = await requireRole(UserRole.ADMIN, UserRole.WORKER, UserRole.CLIENT);
  if (!auth.ok) return auth.response;
  const audience = auth.session.user.role === UserRole.CLIENT ? "client" : "internal";

  const { id } = await resolveRouteParams(params);

  const order = await db.order.findUnique({
    where: { id },
    include: {
      materialLines: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!order) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const isClient = auth.session.user.role === UserRole.CLIENT;
  if (isClient && order.clientId !== auth.session.user.id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(serializeOrder(order, { audience }), { status: 200 });
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

  if (hasLaborAmount) {
    const parsedLabor = setLaborAmountSchema.safeParse(body.data);
    if (!parsedLabor.success) {
      return validationErrorResponse(parsedLabor.error);
    }

    const { id } = await resolveRouteParams(params);
    const order = await db.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
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
      include: {
        materialLines: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json(serializeOrder(updated), { status: 200 });
  }

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
    include: {
      materialLines: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return NextResponse.json(serializeOrder(updated), { status: 200 });
}
