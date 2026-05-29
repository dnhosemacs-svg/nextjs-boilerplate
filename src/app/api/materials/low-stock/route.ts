import { NextResponse } from "next/server";

import { requireRole } from "@/lib/api-auth";
import { listLowStockMaterials } from "@/lib/dashboard-queries";
import { UserRole } from "@/types/user-role";

export async function GET() {
  const auth = await requireRole(UserRole.ADMIN, UserRole.WORKER);
  if (!auth.ok) return auth.response;

  const items = await listLowStockMaterials();
  return NextResponse.json(items, { status: 200 });
}
