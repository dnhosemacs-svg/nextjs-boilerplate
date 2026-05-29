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

const adminUserListSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
} as const;

export type AdminUserListItem = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: Date;
};

export async function listUsersForAdmin(): Promise<AdminUserListItem[]> {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: adminUserListSelect,
  });
  return users.map((user) => ({
    ...user,
    role: user.role as UserRole,
  }));
}

export async function findUserById(id: string) {
  return db.user.findUnique({
    where: { id },
    select: adminUserListSelect,
  });
}

export async function createAppUser(input: {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
}) {
  return db.user.create({
    data: {
      id: input.id,
      email: input.email.toLowerCase(),
      name: input.name ?? null,
      role: input.role,
    },
    select: adminUserListSelect,
  });
}

export async function updateUserByAdmin(
  id: string,
  input: { role?: UserRole; name?: string | null },
) {
  const data: { role?: UserRole; name?: string | null } = {};
  if (input.role !== undefined) data.role = input.role;
  if (input.name !== undefined) data.name = input.name;

  return db.user.update({
    where: { id },
    data,
    select: adminUserListSelect,
  });
}
