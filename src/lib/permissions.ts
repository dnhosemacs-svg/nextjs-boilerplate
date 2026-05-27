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

/** Entradas manuales y salidas de almacén. */
export function canRecordStockInOut(role: UserRole): boolean {
  return role === R.ADMIN || role === R.WORKER;
}

/** Salidas vinculadas a pedido (operativa de taller). */
export function canRecordStockOut(role: UserRole): boolean {
  return role === R.ADMIN || role === R.WORKER;
}

/** Ajustes de inventario: por defecto solo ADMIN. */
export function canRecordStockAdjust(role: UserRole): boolean {
  return role === R.ADMIN;
}

/** Cambio de estado del pedido (ownership del cliente se valida en la API). */
export function canChangeOrderStatus(
  role: UserRole,
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return canTransitionOrder(from, to, role);
}
