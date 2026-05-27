import { NextResponse } from "next/server";

import { requireRole } from "@/lib/api-auth";
import {
  type IdRouteContext,
  parseJsonBody,
  resolveRouteParams,
  validationErrorResponse,
} from "@/lib/api-route-utils";
import { findUserById, updateUserRole } from "@/lib/users";
import { updateUserRoleSchema } from "@/lib/validators/user";
import { UserRole } from "@/types/user-role";

export async function PATCH(request: Request, { params }: IdRouteContext) {
  const auth = await requireRole(UserRole.ADMIN);
  if (!auth.ok) return auth.response;

  const { id } = await resolveRouteParams(params);

  if (id === auth.session.user.id) {
    return NextResponse.json(
      { error: "No puedes cambiar tu propio rol aquí" },
      { status: 400 },
    );
  }

  const existing = await findUserById(id);
  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (existing.role === UserRole.ADMIN) {
    return NextResponse.json(
      { error: "No se puede cambiar el rol de un administrador" },
      { status: 403 },
    );
  }

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = updateUserRoleSchema.safeParse(body.data);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const updated = await updateUserRole(id, parsed.data.role);
  return NextResponse.json(updated, { status: 200 });
}
