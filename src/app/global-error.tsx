"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)] antialiased">
        <main className="mx-auto flex min-h-full max-w-lg flex-col justify-center gap-4 p-8">
          <h1 className="text-2xl font-semibold">Algo salió mal</h1>
          <p className="text-[var(--muted)]">
            Ha ocurrido un error inesperado. El equipo ha sido notificado.
          </p>
          <button
            type="button"
            className="carbon-btn-primary self-start"
            onClick={() => reset()}
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
