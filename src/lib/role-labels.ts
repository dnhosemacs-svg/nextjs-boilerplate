import type { UserRole } from "@/types/user-role";
import { UserRole as R } from "@/types/user-role";

const ROLE_LABELS: Record<UserRole, string> = {
  [R.ADMIN]: "Administrador",
  [R.WORKER]: "Operario",
  [R.CLIENT]: "Cliente",
};

export function roleLabel(role: UserRole): string {
  return ROLE_LABELS[role] ?? role;
}
