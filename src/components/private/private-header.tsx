"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { sessionUserLabel } from "@/lib/session-user-label";
import { roleLabel } from "@/lib/role-labels";
import { signOut, useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";

type PrivateHeaderProps = {
  onOpenSidebar: () => void;
};

export default function PrivateHeader({ onOpenSidebar }: PrivateHeaderProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAuthenticated = status === "authenticated" && !!session?.user;
  const userLabel =
    isAuthenticated && session?.user ? sessionUserLabel(session.user) : null;
  const loginHref = `/login?${new URLSearchParams({ callbackUrl: pathname }).toString()}`;

  async function onLogout() {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: "/login" });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="private-header">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="private-header-menu-btn ui-pill ui-pill-secondary"
      >
        Menú
      </button>

      <div className="private-header-actions" aria-busy={status === "loading"}>
        {status === "loading" ? (
          <>
            <span className="hidden max-w-[11rem] truncate text-sm text-[var(--muted)] sm:inline">
              …
            </span>
            <span
              className="ui-pill ui-pill-secondary pointer-events-none opacity-60"
              aria-hidden
            >
              …
            </span>
          </>
        ) : (
          <>
            {isAuthenticated && session?.user?.role ? (
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {roleLabel(session.user.role)}
              </Badge>
            ) : null}

            {userLabel ? (
              <span
                className="hidden max-w-[11rem] shrink-0 truncate text-sm text-[var(--muted)] sm:inline"
                title={session?.user?.email ?? undefined}
              >
                {userLabel}
              </span>
            ) : null}

            {isAuthenticated ? (
              <button
                type="button"
                onClick={onLogout}
                disabled={isLoggingOut}
                className="ui-pill ui-pill-secondary"
              >
                {isLoggingOut ? "Saliendo..." : "Cerrar sesión"}
              </button>
            ) : (
              <Link href={loginHref} className="ui-pill ui-pill-secondary">
                Iniciar sesión
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  );
}
