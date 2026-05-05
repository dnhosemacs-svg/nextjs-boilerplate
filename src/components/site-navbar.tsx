"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/tasks/new", label: "Pedidos" },
  { href: "/stats", label: "Estadísticas" },
  { href: "/about", label: "About" },
  { href: "/info", label: "Info" },
];

function isActivePath(currentPath: string, href: string) {
  if (href === "/") return currentPath === "/";
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export default function SiteNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/15 dark:bg-black/85">
      <div className="flex w-full items-center justify-between gap-6 px-8 py-5">
        <Link
          href="/"
          className="shrink-0 whitespace-nowrap font-normal tracking-tight text-white"
          style={{ fontSize: "30px", lineHeight: 1 }}
        >
          Carpintería Tablas y serrín
        </Link>

        <div className="hidden flex-1 items-center justify-end gap-5 md:flex">
          <nav>
            <ul className="flex items-center gap-3">
              {navItems.map((item, index) => {
                const isActive = isActivePath(pathname, item.href);
                return (
                  <li key={item.href} className="flex items-center gap-3">
                    <Link
                      href={item.href}
                      className={`inline-flex min-h-9 items-center justify-center rounded-full px-6 py-2.5 leading-none text-xs font-semibold transition ${
                        isActive
                          ? "!bg-white !text-black min-w-16"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {item.label}
                    </Link>
                    {index < navItems.length - 1 ? (
                      <span className="text-white/45">|</span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>

          <Link href="/login" className="ui-pill ui-pill-secondary px-4">
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
