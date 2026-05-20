import { NextResponse } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import { requireApiSession } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { updateCategorySchema } from "@/lib/validators/category";

type Context = {
  params: { id: string } | Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Context) {
  const auth = await requireApiSession();
  if (!auth.ok) return auth.response;

  const { id } = await Promise.resolve(params);

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo JSON no válido" },
      { status: 400 },
    );
  }

  const parsed = updateCategorySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Error de validación", issues: parsed.error.issues },
      { status: 400 },
    );
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

export async function DELETE(_request: Request, { params }: Context) {
  const auth = await requireApiSession();
  if (!auth.ok) return auth.response;

  const { id } = await Promise.resolve(params);

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
