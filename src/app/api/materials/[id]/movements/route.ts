import { NextResponse } from "next/server";

import { API_ERROR_MESSAGES, jsonApiError } from "@/lib/api-error";
import { requireRole } from "@/lib/api-auth";
import {
  type IdRouteContext,
  parseJsonBody,
  resolveRouteParams,
  validationErrorResponse,
} from "@/lib/api-route-utils";
import { db } from "@/lib/db";
import { recordMovement, StockServiceError } from "@/lib/stock-service";
import {
  recordStockAdjustSchema,
  recordStockInSchema,
} from "@/lib/validators/stock-movement";
import { UserRole } from "@/types/user-role";

type MovementRequestBody = {
  type?: "IN" | "ADJUST";
  quantity?: unknown;
  reason?: unknown;
  orderId?: unknown;
};

export async function GET(_request: Request, { params }: IdRouteContext) {
  const auth = await requireRole(UserRole.ADMIN, UserRole.WORKER);
  if (!auth.ok) return auth.response;

  const { id } = await resolveRouteParams(params);

  const material = await db.material.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!material) {
    return jsonApiError(API_ERROR_MESSAGES.NOT_FOUND, 404);
  }

  const movements = await db.stockMovement.findMany({
    where: { materialId: id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      quantity: true,
      reason: true,
      materialId: true,
      orderId: true,
      userId: true,
      createdAt: true,
    },
    take: 100,
  });

  return NextResponse.json(
    movements.map((movement) => ({
      ...movement,
      quantity: movement.quantity.toString(),
    })),
    { status: 200 },
  );
}

export async function POST(request: Request, { params }: IdRouteContext) {
  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const payload = body.data as MovementRequestBody;
  const type = payload.type;

  if (type !== "IN" && type !== "ADJUST") {
    return jsonApiError("Tipo de movimiento no válido", 400);
  }

  const auth =
    type === "ADJUST"
      ? await requireRole(UserRole.ADMIN)
      : await requireRole(UserRole.ADMIN, UserRole.WORKER);
  if (!auth.ok) return auth.response;

  const { id } = await resolveRouteParams(params);

  const dataByType = {
    quantity: payload.quantity,
    reason: payload.reason,
    orderId: payload.orderId,
  };

  const parsed =
    type === "IN"
      ? recordStockInSchema.safeParse(dataByType)
      : recordStockAdjustSchema.safeParse(dataByType);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const result = await recordMovement({
      materialId: id,
      type,
      quantity: parsed.data.quantity,
      reason: parsed.data.reason,
      orderId:
        "orderId" in parsed.data && typeof parsed.data.orderId === "string"
          ? parsed.data.orderId
          : undefined,
      userId: auth.session.user.id,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (!(error instanceof StockServiceError)) throw error;

    if (error.code === "MATERIAL_NOT_FOUND" || error.code === "ORDER_NOT_FOUND") {
      return jsonApiError(API_ERROR_MESSAGES.NOT_FOUND, 404);
    }
    if (error.code === "INSUFFICIENT_AVAILABLE") {
      return jsonApiError(error.message, 409);
    }
    if (error.code === "REASON_REQUIRED" || error.code === "INVALID_MOVEMENT") {
      return jsonApiError(error.message, 400);
    }

    throw error;
  }
}
