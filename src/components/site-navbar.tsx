"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/tasks/new", label: "Nuevo pedido" },
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
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgb(246_240_231/92%)] backdrop-blur supports-[backdrop-filter]:bg-[rgb(246_240_231/80%)]">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link
          href="/"
          className="shrink-0 whitespace-nowrap pr-4 font-[var(--font-cormorant)] text-2xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl"
        >
          Carpintería Tablas y serrín
        </Link>

        <div className="flex w-full items-center justify-between gap-3 md:w-auto md:flex-1 md:justify-end md:gap-5">
          <nav aria-label="Principal" className="overflow-x-auto">
            <ul className="flex items-center gap-2 pb-1">
              {navItems.map((item) => {
                const isActive = isActivePath(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`inline-flex min-h-10 items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition md:px-5 ${
                        isActive
                          ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--surface)] shadow-sm"
                          : "border-[var(--line)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--brand)] hover:bg-[var(--surface-strong)]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <Link href="/login" className="ui-pill ui-pill-secondary shrink-0">
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
