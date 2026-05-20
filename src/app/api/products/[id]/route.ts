import { NextResponse } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import { requireApiSession } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { updateProductSchema } from "@/lib/validators/product";

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

  const parsed = updateProductSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Error de validación", issues: parsed.error.issues },
      { status: 400 },
    );
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
    return NextResponse.json(
      { ...updated, price: updated.price.toString() },
      { status: 200 },
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

export async function DELETE(_request: Request, { params }: Context) {
  const auth = await requireApiSession();
  if (!auth.ok) return auth.response;

  const { id } = await Promise.resolve(params);

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const deleted = await db.product.delete({ where: { id } });
  return NextResponse.json(
    { ...deleted, price: deleted.price.toString() },
    { status: 200 },
  );
}
