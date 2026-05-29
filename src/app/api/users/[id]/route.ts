import { NextResponse } from "next/server";

import { requireRole } from "@/lib/api-auth";
import {
  type IdRouteContext,
  parseJsonBody,
  resolveRouteParams,
  validationErrorResponse,
} from "@/lib/api-route-utils";
import { findUserById, updateUserByAdmin } from "@/lib/users";
import { updateUserByAdminSchema } from "@/lib/validators/user";
import { UserRole } from "@/types/user-role";

export async function PATCH(request: Request, { params }: IdRouteContext) {
  const auth = await requireRole(UserRole.ADMIN);
  if (!auth.ok) return auth.response;

  const { id } = await resolveRouteParams(params);

  const existing = await findUserById(id);
  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = updateUserByAdminSchema.safeParse(body.data);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { role, name } = parsed.data;

  if (role !== undefined) {
    if (id === auth.session.user.id) {
      return NextResponse.json(
        { error: "No puedes cambiar tu propio rol aquí" },
        { status: 400 },
      );
    }

    if (existing.role === UserRole.ADMIN) {
      return NextResponse.json(
        { error: "No se puede cambiar el rol de un administrador" },
        { status: 403 },
      );
    }
  }

  const updated = await updateUserByAdmin(id, {
    ...(role !== undefined ? { role } : {}),
    ...(name !== undefined ? { name: name === "" ? null : name } : {}),
  });
  return NextResponse.json(updated, { status: 200 });
}
