import { NextResponse } from "next/server";

import { requireRole } from "@/lib/api-auth";
import { syncFirebaseUsersToDatabase } from "@/lib/sync-firebase-users";
import { isFirebaseAdminConfigured } from "@/lib/server-env";
import { UserRole } from "@/types/user-role";

export async function POST() {
  const auth = await requireRole(UserRole.ADMIN);
  if (!auth.ok) return auth.response;

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Firebase Admin no configurado en el servidor" },
      { status: 503 },
    );
  }

  const result = await syncFirebaseUsersToDatabase();
  return NextResponse.json(result, { status: 200 });
}
