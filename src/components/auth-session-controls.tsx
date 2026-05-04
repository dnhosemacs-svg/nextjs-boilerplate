"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@carbon/react";

type AuthSessionControlsProps = {
  isAuthenticated: boolean;
};

export default function AuthSessionControls({
  isAuthenticated,
}: AuthSessionControlsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onLogout() {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("No se pudo cerrar la sesión.");
      }
      router.push("/");
      router.refresh();
    } catch (logoutError) {
      const message =
        logoutError instanceof Error ? logoutError.message : "Error inesperado";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-dashed border-black/15 p-5 dark:border-white/20 carbon-shell md:p-6">
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Estado de sesión:{" "}
        <strong>{isAuthenticated ? "autenticado" : "no autenticado"}</strong>
      </p>
      <div className="flex flex-wrap gap-3">
        {isAuthenticated ? (
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
