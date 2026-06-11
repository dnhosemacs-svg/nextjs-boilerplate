import { NextResponse } from "next/server";

import { API_ERROR_MESSAGES, jsonApiError } from "@/lib/api-error";
import { requireRole } from "@/lib/api-auth";
import {
  type IdRouteContext,
  resolveRouteParams,
} from "@/lib/api-route-utils";
import { captureServerError } from "@/lib/capture-server-error";
import {
  getMaterialStock,
  StockServiceError,
} from "@/lib/stock-service";
import { UserRole } from "@/types/user-role";

export async function GET(_request: Request, { params }: IdRouteContext) {
  const auth = await requireRole(UserRole.ADMIN, UserRole.WORKER);
  if (!auth.ok) return auth.response;

  const { id } = await resolveRouteParams(params);

  try {
    const stock = await getMaterialStock(id);
    return NextResponse.json(stock, { status: 200 });
  } catch (error) {
    if (
      error instanceof StockServiceError &&
      error.code === "MATERIAL_NOT_FOUND"
    ) {
      return jsonApiError(API_ERROR_MESSAGES.NOT_FOUND, 404);
    }

    captureServerError(error, {
      route: "GET /api/materials/:id/stock",
      tags: { module: "inventory" },
      extra: { materialId: id },
    });
    throw error;
  }
}
