"use client";

import Link from "next/link";
import SiteLogo from "@/components/site-logo";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { sessionUserLabel } from "@/lib/session-user-label";
import { signOut, useSession } from "next-auth/react";

const publicNavItems = [
  { href: "/", label: "Inicio" },
  { href: "/about", label: "Nosotros" },
  { href: "/info", label: "Servicios" },
];

const privateNavItems = [
  { href: "/dashboard", label: "Panel" },
  { href: "/tasks/new", label: "Nuevo pedido" },
  { href: "/stats", label: "Estadísticas" },
];

function isActivePath(currentPath: string, href: string) {
  if (href === "/") return currentPath === "/";
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

function SiteLogoLink() {
  return (
    <Link href="/" className="site-header-logo" aria-label="Carpintería — inicio">
      <SiteLogo className="site-logo-svg" />
    </Link>
  );
}

function SiteHeaderAuth({
  status,
  userLabel,
  sessionEmail,
  isLoggingOut,
  onLogout,
  isAuthenticated,
}: {
  status: string;
  userLabel: string | null;
  sessionEmail?: string | null;
  isLoggingOut: boolean;
  onLogout: () => void;
  isAuthenticated: boolean;
}) {
  return (
    <div className="site-header-actions" aria-busy={status === "loading"}>
      {userLabel ? (
        <span
          className="hidden max-w-[11rem] shrink-0 truncate text-sm text-[var(--muted)] sm:inline"
          title={sessionEmail ?? undefined}
        >
          {userLabel}
        </span>
      ) : null}

      {status === "loading" ? (
        <span
          className="ui-pill ui-pill-secondary shrink-0 pointer-events-none opacity-60"
          aria-hidden
        >
          …
        </span>
      ) : isAuthenticated ? (
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
          Iniciar sesión
        </Link>
      )}
    </div>
  );
}

export default function SiteNavbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAuthenticated = status === "authenticated" && !!session?.user;
  const userLabel =
    isAuthenticated && session?.user ? sessionUserLabel(session.user) : null;
  const navItems = isAuthenticated
    ? [privateNavItems[0], ...publicNavItems, ...privateNavItems.slice(1)]
    : publicNavItems;

  async function onLogout() {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: "/login" });
    } finally {
      setIsLoggingOut(false);
    }
  }

  const authProps = {
    status,
    userLabel,
    sessionEmail: session?.user?.email,
    isLoggingOut,
    onLogout,
    isAuthenticated,
  };

  return (
    <div className="site-header-bar">
      <SiteLogoLink />

      <div className="site-header-nav">
        <header className="site-navbar">
          <nav aria-label="Principal">
            <ul className="site-navbar-list">
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
        </header>
      </div>

      <SiteHeaderAuth {...authProps} />
    </div>
  );
}
