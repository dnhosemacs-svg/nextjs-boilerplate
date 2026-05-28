import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { requireRole } from "@/lib/api-auth";
import { parseJsonBody, validationErrorResponse } from "@/lib/api-route-utils";
import { db } from "@/lib/db";
import { serializeOrder } from "@/lib/serializers/order";
import { createOrderSchema } from "@/lib/validators/order";
import { UserRole } from "@/types/user-role";

export async function POST(request: Request) {
  const auth = await requireRole(UserRole.ADMIN, UserRole.WORKER, UserRole.CLIENT);
  if (!auth.ok) return auth.response;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const payload =
    auth.session.user.role === UserRole.CLIENT
      ? { ...(body.data as object), clientId: auth.session.user.id }
      : body.data;

  const parsed = createOrderSchema.safeParse(payload);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const created = await db.order.create({
    data: {
      clientId: parsed.data.clientId,
      furnitureType: parsed.data.furnitureType,
      parameters: parsed.data.params,
      notes: parsed.data.notes?.trim() || null,
      status: "DRAFT",
    },
  });

  return NextResponse.json(serializeOrder(created), { status: 201 });
}

export async function GET(request: Request) {
  const auth = await requireRole(UserRole.ADMIN, UserRole.WORKER, UserRole.CLIENT);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const furnitureType = url.searchParams.get("furnitureType");
  const clientIdQuery = url.searchParams.get("clientId");

  const where: Prisma.OrderWhereInput = {};

  if (status) where.status = status as Prisma.EnumOrderStatusFilter["equals"];
  if (furnitureType) where.furnitureType = furnitureType;

  if (auth.session.user.role === UserRole.CLIENT) {
    where.clientId = auth.session.user.id;
  } else if (clientIdQuery) {
    where.clientId = clientIdQuery;
  }

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders.map(serializeOrder), { status: 200 });
}
