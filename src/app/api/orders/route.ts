import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { requireRole } from "@/lib/api-auth";
import { parseJsonBody, validationErrorResponse } from "@/lib/api-route-utils";
import { db } from "@/lib/db";
import { buildOrderListWhere } from "@/lib/order-access";
import { recordOrderStatusEvent } from "@/lib/order-status-events";
import { orderDetailInclude } from "@/lib/order-queries";
import { serializeOrderFromDetail } from "@/lib/serializers/order";
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
      parameters: parsed.data.params as Prisma.InputJsonValue,
      notes: parsed.data.notes?.trim() || null,
      status: "DRAFT",
    },
    include: orderDetailInclude,
  });

  await recordOrderStatusEvent(created.id, "DRAFT", auth.session.user.id);

  return NextResponse.json(serializeOrderFromDetail(created), { status: 201 });
}

export async function GET(request: Request) {
  const auth = await requireRole(UserRole.ADMIN, UserRole.WORKER, UserRole.CLIENT);
  if (!auth.ok) return auth.response;
  const role = auth.session.user.role;
  const audience = role === UserRole.CLIENT ? "client" : "internal";

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const furnitureType = url.searchParams.get("furnitureType");
  const clientIdQuery = url.searchParams.get("clientId");
  const hasShortagesParam = url.searchParams.get("hasShortages");
  const unassignedParam = url.searchParams.get("unassigned");

  if (hasShortagesParam === "true" && role === UserRole.CLIENT) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (unassignedParam === "true" && role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const where = buildOrderListWhere({
    role,
    sessionUserId: auth.session.user.id,
    status,
    furnitureType,
    clientId: clientIdQuery,
    hasShortages: hasShortagesParam === "true",
    unassigned: unassignedParam === "true",
  });

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: orderDetailInclude,
  });

  return NextResponse.json(
    orders.map((order) => serializeOrderFromDetail(order, { audience })),
    { status: 200 },
  );
}
