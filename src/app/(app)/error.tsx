"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AppError({
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
    <div className="mx-auto flex max-w-lg flex-col gap-4 p-8">
      <h2 className="text-xl font-semibold">Error en el panel</h2>
      <p className="text-sm text-muted-foreground">
        No se pudo cargar esta sección. Puedes reintentar o volver al inicio del
        panel.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => reset()}>
          Reintentar
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            window.location.href = "/dashboard";
          }}
        >
          Ir al dashboard
        </Button>
      </div>
    </div>
  );
}
