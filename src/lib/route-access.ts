import type { UserRole } from "@/types/user-role";
import { isUserRole } from "@/types/user-role";
import { canAccessInventory, canManageUsers } from "@/lib/permissions";

export const ADMIN_PAGE_PREFIXES = ["/admin"] as const;
export const WAREHOUSE_PAGE_PREFIXES = ["/products", "/categories"] as const;

export function pathnameStartsWith(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isAdminPage(pathname: string): boolean {
  return ADMIN_PAGE_PREFIXES.some((p) => pathnameStartsWith(pathname, p));
}

export function isWarehousePage(pathname: string): boolean {
  return WAREHOUSE_PAGE_PREFIXES.some((p) => pathnameStartsWith(pathname, p));
}

export function getTokenRole(token: unknown): UserRole | null {
  if (!token || typeof token !== "object") return null;
  const role = (token as { role?: unknown }).role;
  return isUserRole(role) ? role : null;
}

export function canAccessAdminPage(role: UserRole | null): boolean {
  return role ? canManageUsers(role) : false;
}

export function canAccessWarehousePage(role: UserRole | null): boolean {
  return role ? canAccessInventory(role) : false;
}

