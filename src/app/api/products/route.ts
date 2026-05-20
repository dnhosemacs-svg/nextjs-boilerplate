import { NextResponse } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import { requireApiSession } from "@/lib/api-auth";
import { db } from "@/lib/db";
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
  const auth = await requireApiSession();
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
    return NextResponse.json(
      { error: "Error de validación", issues: parsed.error.issues },
      { status: 400 },
    );
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

  const body = products.map((p) => ({
    ...p,
    price: p.price.toString(),
  }));

  return NextResponse.json(body, { status: 200 });
}

export async function POST(request: Request) {
  const auth = await requireApiSession();
  if (!auth.ok) return auth.response;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo JSON no válido" },
      { status: 400 },
    );
  }

  const parsed = createProductSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Error de validación", issues: parsed.error.issues },
      { status: 400 },
    );
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

    return NextResponse.json(
      { ...created, price: created.price.toString() },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return NextResponse.json(
          { error: "Ya existe un producto con ese SKU" },
          { status: 409 },
        );
      }
      if (e.code === "P2003") {
        return NextResponse.json(
          { error: "La categoría indicada no existe" },
          { status: 400 },
        );
      }
    }
    throw e;
  }
}
