import { NextResponse } from "next/server";

import { requireRole } from "@/lib/api-auth";
import {
  createFirebaseUser,
  isFirebaseEmailAlreadyExists,
} from "@/lib/firebase-admin";
import {
  parseJsonBody,
  validationErrorResponse,
} from "@/lib/api-route-utils";
import { handlePrismaWriteError } from "@/lib/prisma-errors";
import { isFirebaseAdminConfigured } from "@/lib/server-env";
import { createAppUser, listUsersForAdmin } from "@/lib/users";
import { createUserByAdminSchema } from "@/lib/validators/user";
import { UserRole } from "@/types/user-role";

export async function GET() {
  const auth = await requireRole(UserRole.ADMIN);
  if (!auth.ok) return auth.response;

  const users = await listUsersForAdmin();
  return NextResponse.json(users, { status: 200 });
}

export async function POST(request: Request) {
  const auth = await requireRole(UserRole.ADMIN);
  if (!auth.ok) return auth.response;

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Firebase Admin no configurado en el servidor" },
      { status: 503 },
    );
  }

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = createUserByAdminSchema.safeParse(body.data);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { email, password, name, role } = parsed.data;

  try {
    const fbUser = await createFirebaseUser({
      email,
      password,
      displayName: name,
    });

    try {
      const user = await createAppUser({
        id: fbUser.uid,
        email,
        name: name ?? null,
        role,
      });
      return NextResponse.json(user, { status: 201 });
    } catch (error) {
      const prismaError = handlePrismaWriteError(error, {
        unique: "Ya existe un usuario con ese correo",
      });
      if (prismaError) return prismaError;
      throw error;
    }
  } catch (error) {
    if (isFirebaseEmailAlreadyExists(error)) {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese correo" },
        { status: 409 },
      );
    }
    throw error;
  }
}
