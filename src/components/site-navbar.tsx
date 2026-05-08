"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const baseNavItems = [
  { href: "/", label: "Inicio" },
  { href: "/about", label: "Sobre" },
  { href: "/info", label: "Guía" },
];

const authOnlyNavItems = [
  { href: "/tasks/new", label: "Nuevo pedido" },
  { href: "/stats", label: "Estadísticas" },
];

function isActivePath(currentPath: string, href: string) {
  if (href === "/") return currentPath === "/";
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

type SiteNavbarProps = {
  isAuthenticated: boolean;
};

export default function SiteNavbar({ isAuthenticated }: SiteNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navItems = isAuthenticated
    ? [baseNavItems[0], ...authOnlyNavItems, ...baseNavItems.slice(1)]
    : baseNavItems;

  async function onLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="flex w-full justify-center">
      <header className="z-50 w-fit max-w-[calc(100vw-1rem)] rounded-2xl border border-[rgb(207_190_167/0.45)] bg-[rgb(246_240_231/90%)] shadow-[0_10px_26px_-22px_rgb(45_34_25/0.7),0_2px_10px_-8px_rgb(45_34_25/0.45)] backdrop-blur-md supports-[backdrop-filter]:bg-[rgb(246_240_231/80%)]">
        <div className="flex items-center justify-center px-4 py-3.5 md:px-5 md:py-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-1 md:gap-4">
            <nav aria-label="Principal">
              <ul className="flex items-center gap-2.5 md:gap-2.5">
                {navItems.map((item) => {
                  const isActive = isActivePath(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={`ui-pill px-6 md:px-7 ${isActive ? "ui-pill-primary" : "ui-pill-secondary"}`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={onLogout}
                disabled={isLoggingOut}
                className="ui-pill ui-pill-secondary shrink-0"
              >
                {isLoggingOut ? "Saliendo..." : "Cerrar sesión"}
              </button>
            ) : (
              <Link href="/login" className="ui-pill ui-pill-secondary shrink-0">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
