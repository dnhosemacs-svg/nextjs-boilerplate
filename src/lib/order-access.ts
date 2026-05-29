import { NextResponse } from "next/server";

import type { UserRole } from "@/types/user-role";
import { UserRole as R } from "@/types/user-role";

/** CLIENT solo puede operar pedidos donde es el titular (`clientId`). */
export function denyIfClientNotOrderOwner(
  role: UserRole,
  orderClientId: string,
  sessionUserId: string,
): NextResponse | null {
  if (role === R.CLIENT && orderClientId !== sessionUserId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  return null;
}
