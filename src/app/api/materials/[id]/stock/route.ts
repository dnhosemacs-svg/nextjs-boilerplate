import { NextResponse } from "next/server";

import { requireRole } from "@/lib/api-auth";
import {
  type IdRouteContext,
  resolveRouteParams,
} from "@/lib/api-route-utils";
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
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    throw error;
  }
}
