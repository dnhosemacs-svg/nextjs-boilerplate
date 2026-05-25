import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import {
  type IdRouteContext,
  parseJsonBody,
  resolveRouteParams,
  validationErrorResponse,
} from "@/lib/api-route-utils";
import { db } from "@/lib/db";
import { handlePrismaWriteError } from "@/lib/prisma-errors";
import { serializeProduct } from "@/lib/serializers/product";
import { updateProductSchema } from "@/lib/validators/product";

export async function PATCH(request: Request, { params }: IdRouteContext) {
  const auth = await requireApiSession();
  if (!auth.ok) return auth.response;

  const { id } = await resolveRouteParams(params);
  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = updateProductSchema.safeParse(body.data);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  try {
    const updated = await db.product.update({
      where: { id },
      data: parsed.data,
      include: { category: true },
    });
    return NextResponse.json(serializeProduct(updated), { status: 200 });
  } catch (error) {
    const prismaError = handlePrismaWriteError(error, {
      unique: "Ya existe un producto con ese SKU",
      foreignKey: "La categoría indicada no existe",
    });
    if (prismaError) return prismaError;
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: IdRouteContext) {
  const auth = await requireApiSession();
  if (!auth.ok) return auth.response;

  const { id } = await resolveRouteParams(params);

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const deleted = await db.product.delete({ where: { id } });
  return NextResponse.json(serializeProduct(deleted), { status: 200 });
}
