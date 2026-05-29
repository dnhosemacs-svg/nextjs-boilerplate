import { NextResponse } from "next/server";

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
import { recordOrderStatusEvent } from "@/lib/order-status-events";
import {
  approveOrder,
  cancelOrder,
  OrderWorkflowError,
} from "@/lib/order-workflow";
import { parseOrderTransition, transitionOrderSchema } from "@/lib/validators/order";
import { UserRole } from "@/types/user-role";

export async function PATCH(request: Request, { params }: IdRouteContext) {
  const auth = await requireRole(UserRole.ADMIN, UserRole.WORKER, UserRole.CLIENT);
  if (!auth.ok) return auth.response;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsedBody = transitionOrderSchema.safeParse(body.data);
  if (!parsedBody.success) {
    return validationErrorResponse(parsedBody.error);
  }
  const status = parsedBody.data.status;

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

  const transition = parseOrderTransition(
    order.status,
    { status },
    auth.session.user.role,
  );
  if (!transition.success) {
    return validationErrorResponse(transition.error);
  }

  try {
    if (status === "APPROVED") {
      await approveOrder(id, auth.session.user.role, auth.session.user.id);
    } else if (status === "CANCELLED") {
      await cancelOrder(id, auth.session.user.role, auth.session.user.id);
    } else {
      await db.order.update({
        where: { id },
        data: { status },
      });
    }

    await recordOrderStatusEvent(id, status, auth.session.user.id);

    const updatedOrder = await db.order.findUnique({
      where: { id },
      include: orderDetailInclude,
    });
    if (!updatedOrder) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    return NextResponse.json(serializeOrderFromDetail(updatedOrder), { status: 200 });
  } catch (error) {
    if (!(error instanceof OrderWorkflowError)) throw error;

    if (error.code === "ORDER_NOT_FOUND") {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    if (error.code === "INVALID_TRANSITION") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }
}
