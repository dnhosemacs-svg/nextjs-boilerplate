"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@carbon/react";
import { sessionUserLabel } from "@/lib/session-user-label";
import { signOut, useSession } from "next-auth/react";

export default function AuthSessionControls() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = status === "authenticated" && !!session?.user;

  async function onLogout() {
    setError(null);
    setIsLoading(true);

    try {
      await signOut({ callbackUrl: "/login" });
    } catch (logoutError) {
      const message =
        logoutError instanceof Error ? logoutError.message : "Error inesperado";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  function statusText() {
    if (status === "loading") return "comprobando…";
    if (!isAuthenticated || !session?.user) return "no autenticado";
    return `autenticado (${sessionUserLabel(session.user)})`;
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-dashed border-black/15 p-5 dark:border-white/20 carbon-shell md:p-6">
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Estado de sesión: <strong>{statusText()}</strong>
      </p>
      <div className="flex flex-wrap gap-3">
        {status === "loading" ? (
          <Button
            type="button"
            disabled
            kind="tertiary"
            className="carbon-btn-secondary carbon-btn-compact"
          >
            …
          </Button>
        ) : isAuthenticated ? (
          <Button
            type="button"
            disabled={isLoading}
            onClick={onLogout}
            kind="tertiary"
            className="carbon-btn-secondary carbon-btn-compact"
          >
            {isLoading ? "Saliendo..." : "Cerrar sesión"}
          </Button>
        ) : (
          <Link href="/login" className="inline-flex leading-none">
            <Button kind="primary" className="carbon-btn-primary carbon-btn-compact">
              Ir a login
            </Button>
          </Link>
        )}
      </div>
      {error ? <p className="text-sm text-red-600 dark:text-red-300">{error}</p> : null}
    </div>
  );
}
