"use client";

import Link from "next/link";
import { useState } from "react";
import { sessionUserLabel } from "@/lib/session-user-label";
import { signOut, useSession } from "next-auth/react";

type PrivateHeaderProps = {
  onOpenSidebar: () => void;
};

export default function PrivateHeader({ onOpenSidebar }: PrivateHeaderProps) {
  const { data: session, status } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAuthenticated = status === "authenticated" && !!session?.user;
  const userLabel =
    isAuthenticated && session?.user ? sessionUserLabel(session.user) : null;

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
      <button type="button" onClick={onOpenSidebar} className="ui-pill ui-pill-secondary md:hidden">
        Menú
      </button>

      <div className="private-header-actions" aria-busy={status === "loading"}>
        {status === "loading" ? (
          <span className="hidden max-w-[11rem] truncate text-sm text-[var(--muted)] sm:inline">
            …
          </span>
        ) : userLabel ? (
          <span
            className="hidden max-w-[11rem] shrink-0 truncate text-sm text-[var(--muted)] sm:inline"
            title={session?.user?.email ?? undefined}
          >
            {userLabel}
          </span>
        ) : null}

        <Link href="/stats" className="ui-pill ui-pill-secondary">
          Estadísticas
        </Link>

        {status === "loading" ? (
          <span
            className="ui-pill ui-pill-secondary pointer-events-none opacity-60"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="ui-pill ui-pill-secondary"
          >
            {isLoggingOut ? "Saliendo..." : "Cerrar sesión"}
          </button>
        )}
      </div>
    </header>
  );
}
