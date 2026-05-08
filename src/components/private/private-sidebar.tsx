"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tasks/new", label: "Nuevo pedido" },
  { href: "/stats", label: "Estadísticas" },
];

function isActivePath(currentPath: string, href: string) {
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

type PrivateSidebarProps = {
  open: boolean;
  onClose: () => void;
};

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

        <nav aria-label="Navegación privada">
          <ul className="private-nav-list">
            {navItems.map((item) => {
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
        </nav>
      </aside>
    </>
  );
}
