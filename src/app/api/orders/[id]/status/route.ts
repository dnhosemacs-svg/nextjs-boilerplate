import { NextResponse } from "next/server";

import { requireRole } from "@/lib/api-auth";
import {
  type IdRouteContext,
  parseJsonBody,
  resolveRouteParams,
} from "@/lib/api-route-utils";
import {
  approveOrder,
  cancelOrder,
  OrderWorkflowError,
} from "@/lib/order-workflow";
import { UserRole } from "@/types/user-role";

type TransitionRequestBody = {
  status?: unknown;
};

export async function PATCH(request: Request, { params }: IdRouteContext) {
  const auth = await requireRole(UserRole.ADMIN, UserRole.WORKER);
  if (!auth.ok) return auth.response;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const payload = body.data as TransitionRequestBody;
  const status = payload.status;

  if (status !== "APPROVED" && status !== "CANCELLED") {
    return NextResponse.json(
      { error: "Solo se soporta transición a APPROVED o CANCELLED" },
      { status: 400 },
    );
  }

  const { id } = await resolveRouteParams(params);

  try {
    const result =
      status === "APPROVED"
        ? await approveOrder(id, auth.session.user.role, auth.session.user.id)
        : await cancelOrder(id, auth.session.user.role, auth.session.user.id);

    return NextResponse.json(result, { status: 200 });
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
