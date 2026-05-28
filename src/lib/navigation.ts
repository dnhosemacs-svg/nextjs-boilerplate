export const ORDER_NAV_ITEMS = [
  { href: "/dashboard", label: "Panel" },
  { href: "/orders", label: "Pedidos" },
  { href: "/orders/new", label: "Nuevo pedido" },
  { href: "/tasks/new", label: "Nuevo pedido (legacy)" },
  { href: "/stats", label: "Estadísticas" },
] as const;

export const INVENTORY_NAV_ITEMS = [
  { href: "/products", label: "Materiales" },
  { href: "/categories", label: "Categorías" },
] as const;

export const ADMIN_NAV_ITEMS = [{ href: "/admin/users", label: "Usuarios" }] as const;

export type NavItem = { href: string; label: string };

export function isActivePath(
  currentPath: string,
  href: string,
  options?: { exactRoot?: boolean },
) {
  if (options?.exactRoot && href === "/") {
    return currentPath === "/";
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}
