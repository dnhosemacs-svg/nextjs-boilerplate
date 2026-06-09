import { NextResponse } from "next/server";

import { API_ERROR_MESSAGES, jsonApiError } from "@/lib/api-error";
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
import { serializeMaterial } from "@/lib/serializers/material";
import { updateMaterialSchema } from "@/lib/validators/material";

export async function GET(_request: Request, { params }: IdRouteContext) {
  const auth = await requireRole(UserRole.ADMIN, UserRole.WORKER);
  if (!auth.ok) return auth.response;

  const { id } = await resolveRouteParams(params);

  const material = await db.material.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!material) {
    return jsonApiError(API_ERROR_MESSAGES.NOT_FOUND, 404);
  }

  return NextResponse.json(serializeMaterial(material), { status: 200 });
}

export async function PATCH(request: Request, { params }: IdRouteContext) {
  const auth = await requireRole(UserRole.ADMIN);
  if (!auth.ok) return auth.response;

  const { id } = await resolveRouteParams(params);
  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = updateMaterialSchema.safeParse(body.data);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const existing = await db.material.findUnique({ where: { id } });
  if (!existing) {
    return jsonApiError(API_ERROR_MESSAGES.NOT_FOUND, 404);
  }

  const data = {
    ...parsed.data,
    sku:
      parsed.data.sku === undefined
        ? undefined
        : (parsed.data.sku?.trim() || null),
    location:
      parsed.data.location === undefined
        ? undefined
        : (parsed.data.location?.trim() || null),
  };

  try {
    const updated = await db.material.update({
      where: { id },
      data,
      include: { category: true },
    });
    return NextResponse.json(serializeMaterial(updated), { status: 200 });
  } catch (error) {
    const prismaError = handlePrismaWriteError(error, {
      unique: "Ya existe un material con ese SKU",
      foreignKey: "La categoria indicada no existe",
    });
    if (prismaError) return prismaError;
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: IdRouteContext) {
  const auth = await requireRole(UserRole.ADMIN);
  if (!auth.ok) return auth.response;

  const { id } = await resolveRouteParams(params);

  const existing = await db.material.findUnique({ where: { id } });
  if (!existing) {
    return jsonApiError(API_ERROR_MESSAGES.NOT_FOUND, 404);
  }

  const deleted = await db.material.delete({ where: { id } });
  return NextResponse.json(serializeMaterial(deleted), { status: 200 });
}
