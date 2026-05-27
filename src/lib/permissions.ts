import type { UserRole } from "@/types/user-role";
import { UserRole as R } from "@/types/user-role";

/** Materiales: productos, categorías y lectura de inventario. */
export function canAccessInventory(role: UserRole): boolean {
  return role === R.ADMIN || role === R.WORKER;
}

/** Gestión de usuarios y rutas /admin. */
export function canManageUsers(role: UserRole): boolean {
  return role === R.ADMIN;
}

/** Ajustes de stock (movimientos de inventario). */
export function canWriteStock(role: UserRole): boolean {
  return role === R.ADMIN || role === R.WORKER;
}
