import { db } from "@/lib/db";
import { UserRole as UserRoleConst, type UserRole } from "@/types/user-role";

type UpsertUserInput = {
  id: string;
  email: string;
  name?: string | null;
  role?: UserRole;
};

/**
 * Crea o actualiza el perfil de app (rol, email, nombre) tras login/registro.
 * El id debe ser el Firebase localId (mismo que session.user.id).
 */
export async function upsertUserFromAuth(input: UpsertUserInput) {
  return db.user.upsert({
    where: { id: input.id },
    create: {
      id: input.id,
      email: input.email,
      name: input.name ?? null,
      role: input.role ?? UserRoleConst.CLIENT,
    },
    update: {
      email: input.email,
      ...(input.name !== undefined ? { name: input.name } : {}),
    },
  });
}

export async function getUserRoleById(id: string): Promise<UserRole | null> {
  const user = await db.user.findUnique({
    where: { id },
    select: { role: true },
  });
  if (!user) return null;
  return user.role as UserRole;
}
