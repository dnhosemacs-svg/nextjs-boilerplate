import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { updateProductStockSchema } from "@/lib/validators/product";

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

  const parsed = updateProductStockSchema.safeParse(json);
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

  const updated = await db.product.update({
    where: { id },
    data: { stock: parsed.data.stock },
    include: { category: true },
  });

  return NextResponse.json(
    { ...updated, price: updated.price.toString() },
    { status: 200 },
  );
}
