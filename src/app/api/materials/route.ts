import { NextResponse } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import { requireRole } from "@/lib/api-auth";
import { UserRole } from "@/types/user-role";
import { parseJsonBody, validationErrorResponse } from "@/lib/api-route-utils";
import { db } from "@/lib/db";
import { handlePrismaWriteError } from "@/lib/prisma-errors";
import { serializeMaterial } from "@/lib/serializers/material";
import {
  createMaterialSchema,
  materialListQuerySchema,
  type MaterialListQuery,
} from "@/lib/validators/material";

function orderByFromQuery(
  query: MaterialListQuery,
): Prisma.MaterialOrderByWithRelationInput {
  const dir = query.sortOrder;
  switch (query.sortBy) {
    case "name":
      return { name: dir };
    case "unitCost":
      return { unitCost: dir };
    case "stock":
      return { stock: dir };
    case "minStock":
      return { minStock: dir };
    case "createdAt":
      return { createdAt: dir };
    case "updatedAt":
      return { updatedAt: dir };
    default:
      return { name: dir };
  }
}

export async function GET(request: Request) {
  const auth = await requireRole(UserRole.ADMIN, UserRole.WORKER);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const queryRaw = {
    search: url.searchParams.get("search") ?? undefined,
    categoryId: url.searchParams.get("categoryId") ?? undefined,
    sortBy: url.searchParams.get("sortBy") ?? undefined,
    sortOrder: url.searchParams.get("sortOrder") ?? undefined,
  };

  const parsed = materialListQuerySchema.safeParse(queryRaw);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const query = parsed.data;

  const where: Prisma.MaterialWhereInput = {};
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { sku: { contains: query.search, mode: "insensitive" } },
      { location: { contains: query.search, mode: "insensitive" } },
    ];
  }
  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  const materials = await db.material.findMany({
    where,
    orderBy: orderByFromQuery(query),
    include: { category: true },
  });

  return NextResponse.json(materials.map(serializeMaterial), { status: 200 });
}

export async function POST(request: Request) {
  const auth = await requireRole(UserRole.ADMIN);
  if (!auth.ok) return auth.response;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = createMaterialSchema.safeParse(body.data);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { name, sku, unit, unitCost, minStock, location, categoryId } = parsed.data;

  try {
    const created = await db.material.create({
      data: {
        name,
        sku: sku?.trim() || null,
        unit,
        unitCost,
        minStock,
        location: location?.trim() || null,
        categoryId,
      },
      include: { category: true },
    });

    return NextResponse.json(serializeMaterial(created), { status: 201 });
  } catch (error) {
    const prismaError = handlePrismaWriteError(error, {
      unique: "Ya existe un material con ese SKU",
      foreignKey: "La categoria indicada no existe",
    });
    if (prismaError) return prismaError;
    throw error;
  }
}
