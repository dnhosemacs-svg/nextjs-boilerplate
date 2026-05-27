import { NextResponse } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import { requireRole } from "@/lib/api-auth";
import { UserRole } from "@/types/user-role";
import {
  parseJsonBody,
  validationErrorResponse,
} from "@/lib/api-route-utils";
import { db } from "@/lib/db";
import { handlePrismaWriteError } from "@/lib/prisma-errors";
import { serializeProduct } from "@/lib/serializers/product";
import {
  createProductSchema,
  productListQuerySchema,
  type ProductListQuery,
} from "@/lib/validators/product";

function orderByFromQuery(
  query: ProductListQuery,
): Prisma.ProductOrderByWithRelationInput {
  const dir = query.sortOrder;
  switch (query.sortBy) {
    case "name":
      return { name: dir };
    case "price":
      return { price: dir };
    case "stock":
      return { stock: dir };
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

  const parsed = productListQuerySchema.safeParse(queryRaw);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const query = parsed.data;

  const where: Prisma.ProductWhereInput = {};
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }
  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  const products = await db.product.findMany({
    where,
    orderBy: orderByFromQuery(query),
    include: { category: true },
  });

  return NextResponse.json(products.map(serializeProduct), { status: 200 });
}

export async function POST(request: Request) {
  const auth = await requireRole(UserRole.ADMIN);
  if (!auth.ok) return auth.response;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = createProductSchema.safeParse(body.data);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { name, description, sku, price, stock, categoryId } = parsed.data;

  try {
    const created = await db.product.create({
      data: {
        name,
        description,
        sku,
        price,
        stock,
        categoryId,
      },
      include: { category: true },
    });

    return NextResponse.json(serializeProduct(created), { status: 201 });
  } catch (error) {
    const prismaError = handlePrismaWriteError(error, {
      unique: "Ya existe un producto con ese SKU",
      foreignKey: "La categoría indicada no existe",
    });
    if (prismaError) return prismaError;
    throw error;
  }
}
