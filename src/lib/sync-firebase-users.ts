import { listAllFirebaseUsers } from "@/lib/firebase-admin";
import { db } from "@/lib/db";
import { UserRole as UserRoleConst } from "@/types/user-role";

export type SyncFirebaseUsersResult = {
  totalInFirebase: number;
  created: number;
  updated: number;
  skippedNoEmail: number;
  skippedEmailConflict: number;
};

/**
 * Importa perfiles de Firebase Auth a PostgreSQL.
 * Los usuarios nuevos entran como CLIENT; no se sobrescribe el rol existente.
 */
export async function syncFirebaseUsersToDatabase(): Promise<SyncFirebaseUsersResult> {
  const fbUsers = await listAllFirebaseUsers();

  let created = 0;
  let updated = 0;
  let skippedNoEmail = 0;
  let skippedEmailConflict = 0;

  for (const fbUser of fbUsers) {
    const email = fbUser.email?.trim().toLowerCase();
    if (!email) {
      skippedNoEmail += 1;
      continue;
    }

    const existingById = await db.user.findUnique({
      where: { id: fbUser.uid },
      select: { id: true },
    });

    if (!existingById) {
      const existingByEmail = await db.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (existingByEmail && existingByEmail.id !== fbUser.uid) {
        skippedEmailConflict += 1;
        continue;
      }
    }

    const name = fbUser.displayName?.trim() || null;

    if (!existingById) {
      await db.user.create({
        data: {
          id: fbUser.uid,
          email,
          name,
          role: UserRoleConst.CLIENT,
        },
      });
      created += 1;
    } else {
      await db.user.update({
        where: { id: fbUser.uid },
        data: { email, name },
      });
      updated += 1;
    }
  }

  return {
    totalInFirebase: fbUsers.length,
    created,
    updated,
    skippedNoEmail,
    skippedEmailConflict,
  };
}
