"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSyncFirebaseUsersMutation } from "@/hooks/users";
import type { SyncFirebaseUsersResult } from "@/lib/sync-firebase-users";

function formatSyncSummary(result: SyncFirebaseUsersResult) {
  const parts = [
    `${result.created} nuevos en Neon`,
    `${result.updated} actualizados`,
  ];
  if (result.skippedNoEmail > 0) {
    parts.push(`${result.skippedNoEmail} sin correo (omitidos)`);
  }
  if (result.skippedEmailConflict > 0) {
    parts.push(`${result.skippedEmailConflict} con correo duplicado (omitidos)`);
  }
  return parts.join(" · ");
}

export function AdminUserSync() {
  const syncMutation = useSyncFirebaseUsersMutation();
  const [lastResult, setLastResult] = useState<SyncFirebaseUsersResult | null>(
    null,
  );

  function handleSync() {
    setLastResult(null);
    syncMutation.mutate(undefined, {
      onSuccess: (result) => setLastResult(result),
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[var(--muted)]">
        Trae a Neon las cuentas de Firebase Auth que aún no tienen perfil en el
        taller. Los nuevos entran como cliente; los roles que ya existan (por
        ejemplo administrador) no se modifican.
      </p>
      <Button
        type="button"
        variant="secondary"
        disabled={syncMutation.isPending}
        onClick={handleSync}
      >
        {syncMutation.isPending
          ? "Sincronizando…"
          : "Sincronizar desde Firebase"}
      </Button>
      {syncMutation.isError ? (
        <p className="text-sm text-red-600 dark:text-red-400">
          {syncMutation.error instanceof Error
            ? syncMutation.error.message
            : "No se pudo sincronizar."}
        </p>
      ) : null}
      {lastResult ? (
        <p className="text-sm text-green-800 dark:text-green-300">
          {lastResult.totalInFirebase} en Firebase — {formatSyncSummary(lastResult)}
        </p>
      ) : null}
    </div>
  );
}
