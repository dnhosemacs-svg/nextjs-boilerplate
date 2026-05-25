export const ORDER_NAV_ITEMS = [
  { href: "/dashboard", label: "Panel" },
  { href: "/tasks/new", label: "Nuevo pedido" },
  { href: "/stats", label: "Estadísticas" },
] as const;

export const INVENTORY_NAV_ITEMS = [
  { href: "/products", label: "Productos" },
  { href: "/categories", label: "Categorías" },
] as const;

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
