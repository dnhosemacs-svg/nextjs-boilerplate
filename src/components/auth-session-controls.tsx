"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
        throw new Error("No se pudo cerrar la sesion.");
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
    <div className="mt-4 space-y-2 rounded-xl border border-dashed border-black/15 p-4 dark:border-white/20">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Estado de sesion:{" "}
        <strong>{isAuthenticated ? "autenticado" : "no autenticado"}</strong>
      </p>
      <div className="flex flex-wrap gap-3">
        {isAuthenticated ? (
          <button
            type="button"
            disabled={isLoading}
            onClick={onLogout}
            className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 px-4 text-sm font-medium hover:bg-black/[.04] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:hover:bg-white/10"
          >
            {isLoading ? "Saliendo..." : "Cerrar sesion"}
          </button>
        ) : (
          <Link
            href="/login"
            className="inline-flex h-9 items-center justify-center rounded-full bg-black px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Ir a login
          </Link>
        )}
      </div>
      {error ? <p className="text-sm text-red-600 dark:text-red-300">{error}</p> : null}
    </div>
  );
}
