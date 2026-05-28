import { NextResponse } from "next/server";

import { requireRole } from "@/lib/api-auth";
import {
  type IdRouteContext,
  parseJsonBody,
  resolveRouteParams,
  validationErrorResponse,
} from "@/lib/api-route-utils";
import { db } from "@/lib/db";
import {
  consumeRealMaterialsInProduction,
  OrderConsumptionError,
} from "@/lib/order-reservations";
import { serializeOrder } from "@/lib/serializers/order";
import { confirmOrderActualConsumptionSchema } from "@/lib/validators/order";
import { UserRole } from "@/types/user-role";

export async function POST(request: Request, { params }: IdRouteContext) {
  const auth = await requireRole(UserRole.ADMIN, UserRole.WORKER);
  if (!auth.ok) return auth.response;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = confirmOrderActualConsumptionSchema.safeParse(body.data);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { id } = await resolveRouteParams(params);

  try {
    const consumption = await consumeRealMaterialsInProduction(
      id,
      parsed.data.lines,
      auth.session.user.id,
    );

    const updatedOrder = await db.order.findUnique({
      where: { id },
      include: {
        materialLines: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!updatedOrder) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    return NextResponse.json(
      {
        ...serializeOrder(updatedOrder),
        consumption,
      },
      { status: 200 },
    );
  } catch (error) {
    if (!(error instanceof OrderConsumptionError)) throw error;

    if (error.code === "ORDER_NOT_FOUND") {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    if (error.code === "INVALID_STATUS" || error.code === "MATERIAL_LINES_MISMATCH") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.code === "INVALID_ACTUAL_QTY") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }
}
