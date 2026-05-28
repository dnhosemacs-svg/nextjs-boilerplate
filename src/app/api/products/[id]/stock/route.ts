import { NextResponse } from "next/server";

import { requireRole } from "@/lib/api-auth";
import { UserRole } from "@/types/user-role";
import {
  type IdRouteContext,
  parseJsonBody,
  resolveRouteParams,
  validationErrorResponse,
} from "@/lib/api-route-utils";
import { db } from "@/lib/db";
import { serializeMaterial } from "@/lib/serializers/material";
import { z } from "zod";

const updateMaterialStockSchema = z.object({
  stock: z.coerce.number().min(0, "El stock no puede ser negativo").finite(),
});

export async function PATCH(request: Request, { params }: IdRouteContext) {
  const auth = await requireRole(UserRole.ADMIN, UserRole.WORKER);
  if (!auth.ok) return auth.response;

  const { id } = await resolveRouteParams(params);
  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = updateMaterialStockSchema.safeParse(body.data);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  if (process.env.DEMO_STOCK_500 === "true") {
    return NextResponse.json(
      { error: "Error simulado (demo DEMO_STOCK_500)" },
      { status: 500 },
    );
  }

  const existing = await db.material.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const updated = await db.material.update({
    where: { id },
    data: { stock: parsed.data.stock },
    include: { category: true },
  });

  return NextResponse.json(serializeMaterial(updated), { status: 200 });
}
