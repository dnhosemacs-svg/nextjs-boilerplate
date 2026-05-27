export const UserRole = {
  ADMIN: "ADMIN",
  WORKER: "WORKER",
  CLIENT: "CLIENT",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const USER_ROLES = [
  UserRole.ADMIN,
  UserRole.WORKER,
  UserRole.CLIENT,
] as const;

export function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" &&
    (USER_ROLES as readonly string[]).includes(value)
  );
}
