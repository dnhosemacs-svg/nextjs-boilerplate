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
import { handlePrismaWriteError } from "@/lib/prisma-errors";
import { updateCategorySchema } from "@/lib/validators/category";

export async function PATCH(request: Request, { params }: IdRouteContext) {
  const auth = await requireRole(UserRole.ADMIN);
  if (!auth.ok) return auth.response;

  const { id } = await resolveRouteParams(params);
  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = updateCategorySchema.safeParse(body.data);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const existing = await db.category.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  try {
    const updated = await db.category.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    const prismaError = handlePrismaWriteError(error, {
      unique: "Ya existe una categoría con ese nombre",
    });
    if (prismaError) return prismaError;
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: IdRouteContext) {
  const auth = await requireRole(UserRole.ADMIN);
  if (!auth.ok) return auth.response;

  const { id } = await resolveRouteParams(params);

  const category = await db.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!category) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (category._count.products > 0) {
    return NextResponse.json(
      {
        error:
          "No se puede eliminar la categoría porque tiene productos asociados",
      },
      { status: 409 },
    );
  }

  const deleted = await db.category.delete({ where: { id } });
  return NextResponse.json(deleted, { status: 200 });
}
