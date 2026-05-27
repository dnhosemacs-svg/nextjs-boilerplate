import { canTransitionOrder } from "@/lib/order-transitions";
import type { OrderStatus } from "@/types/order-status";
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

/** Cambio de estado del pedido (ownership del cliente se valida en la API). */
export function canChangeOrderStatus(
  role: UserRole,
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return canTransitionOrder(from, to, role);
}
