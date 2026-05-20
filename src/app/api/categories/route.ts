import { NextResponse } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import { requireApiSession } from "@/lib/api-auth";
import { db } from "@/lib/db";
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

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo JSON no válido" },
      { status: 400 },
    );
  }

  const parsed = createCategorySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Error de validación", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const created = await db.category.create({
      data: { name: parsed.data.name },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe una categoría con ese nombre" },
        { status: 409 },
      );
    }
    throw e;
  }
}
