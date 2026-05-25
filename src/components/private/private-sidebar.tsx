"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  INVENTORY_NAV_ITEMS,
  isActivePath,
  ORDER_NAV_ITEMS,
  type NavItem,
} from "@/lib/navigation";

type PrivateSidebarProps = {
  open: boolean;
  onClose: () => void;
};

function NavLinkList({
  items,
  pathname,
  onClose,
}: {
  items: NavItem[];
  pathname: string;
  onClose: () => void;
}) {
  return (
    <ul className="private-nav-list">
      {items.map((item) => {
        const isActive = isActivePath(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onClose}
              aria-current={isActive ? "page" : undefined}
              className={`private-nav-link ${isActive ? "is-active" : ""}`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function PrivateSidebar({ open, onClose }: PrivateSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open ? (
        <button
          type="button"
          className="private-overlay md:hidden"
          onClick={onClose}
          aria-label="Cerrar navegación"
        />
      ) : null}

      <aside className={`private-sidebar ${open ? "is-open" : ""}`}>
        <div className="private-sidebar-top">
          <p className="eyebrow">Panel interno</p>
          <h2 className="section-heading text-3xl">Taller</h2>
        </div>

        <nav aria-label="Inventario">
          <p className="eyebrow mb-2 mt-4">Inventario</p>
          <NavLinkList items={[...INVENTORY_NAV_ITEMS]} pathname={pathname} onClose={onClose} />
        </nav>

        <nav aria-label="Pedidos" className="mt-6">
          <p className="eyebrow mb-2">Pedidos</p>
          <NavLinkList items={[...ORDER_NAV_ITEMS]} pathname={pathname} onClose={onClose} />
        </nav>
      </aside>
    </>
  );
}
