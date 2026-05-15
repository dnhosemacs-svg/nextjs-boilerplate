"use client";

import { useSession } from "next-auth/react";

/**
 * Panel de diagnóstico para comprobar que useSession() recibe el contexto
 * de Providers. Solo se monta en desarrollo (login y dashboard).
 */
export default function SessionDebug() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <aside
        className="rounded-xl border border-dashed border-amber-600/40 bg-amber-50/80 p-4 text-sm text-amber-950"
        aria-live="polite"
        data-testid="session-debug"
      >
        <p className="font-semibold">Session debug (dev)</p>
        <p className="mt-1">Estado: cargando…</p>
      </aside>
    );
  }

  const user = session?.user;

  return (
    <aside
      className="rounded-xl border border-dashed border-amber-600/40 bg-amber-50/80 p-4 text-sm text-amber-950"
      aria-live="polite"
      data-testid="session-debug"
    >
      <p className="font-semibold">Session debug (dev)</p>
      <div className="mt-2 grid gap-1">
        <DebugRow label="status" value={status} />
        <DebugRow label="email" value={user?.email ?? "—"} />
        <DebugRow label="name" value={user?.name ?? "—"} />
        <DebugRow label="user.id" value={user?.id ?? "—"} />
      </div>
    </aside>
  );
}

function DebugRow({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-medium">{label}: </span>
      <span className="font-mono text-xs">{value}</span>
    </p>
  );
}

