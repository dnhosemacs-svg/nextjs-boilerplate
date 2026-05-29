import { NextResponse } from "next/server";

import { requireRole } from "@/lib/api-auth";
import {
  type IdRouteContext,
  parseJsonBody,
  resolveRouteParams,
  validationErrorResponse,
} from "@/lib/api-route-utils";
import { db } from "@/lib/db";
import { replaceOrderWorkerAssignments } from "@/lib/order-assignments";
import { orderDetailInclude } from "@/lib/order-queries";
import { serializeOrderFromDetail } from "@/lib/serializers/order";
import { assignOrderWorkersSchema } from "@/lib/validators/order";
import { UserRole } from "@/types/user-role";

export async function PUT(request: Request, { params }: IdRouteContext) {
  const auth = await requireRole(UserRole.ADMIN);
  if (!auth.ok) return auth.response;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = assignOrderWorkersSchema.safeParse(body.data);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { id } = await resolveRouteParams(params);

  const order = await db.order.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!order) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  try {
    await replaceOrderWorkerAssignments(
      id,
      parsed.data.workerIds,
      auth.session.user.id,
    );
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_WORKERS") {
      return NextResponse.json(
        { error: "Uno o más operarios no son válidos" },
        { status: 400 },
      );
    }
    throw error;
  }

  const updated = await db.order.findUnique({
    where: { id },
    include: orderDetailInclude,
  });
  if (!updated) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(serializeOrderFromDetail(updated), { status: 200 });
}
