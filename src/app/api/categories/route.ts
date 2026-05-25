import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import {
  parseJsonBody,
  validationErrorResponse,
} from "@/lib/api-route-utils";
import { db } from "@/lib/db";
import { handlePrismaWriteError } from "@/lib/prisma-errors";
import { createCategorySchema } from "@/lib/validators/category";

export async function GET() {
  const auth = await requireApiSession();
  if (!auth.ok) return auth.response;

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories, { status: 200 });
}

export async function POST(request: Request) {
  const auth = await requireApiSession();
  if (!auth.ok) return auth.response;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = createCategorySchema.safeParse(body.data);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const created = await db.category.create({
      data: { name: parsed.data.name },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const prismaError = handlePrismaWriteError(error, {
      unique: "Ya existe una categoría con ese nombre",
    });
    if (prismaError) return prismaError;
    throw error;
  }
}
