"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAssignOrderWorkersMutation } from "@/hooks/orders/use-order-mutations";
import { useUsersQuery } from "@/hooks/users";
import type { OrderDto } from "@/types/order";
import { UserRole } from "@/types/user-role";

type OrderWorkerAssignmentProps = {
  order: OrderDto;
  compact?: boolean;
};

function workerLabel(email: string, name: string | null) {
  return name?.trim() ? `${name} (${email})` : email;
}

export function OrderWorkerAssignment({ order, compact = false }: OrderWorkerAssignmentProps) {
  const { data: users = [] } = useUsersQuery();
  const assignMutation = useAssignOrderWorkersMutation();

  const workers = useMemo(
    () => users.filter((user) => user.role === UserRole.WORKER),
    [users],
  );

  const [selectedIds, setSelectedIds] = useState<string[]>(
    order.assignedWorkers.map((worker) => worker.id),
  );

  useEffect(() => {
    setSelectedIds(order.assignedWorkers.map((worker) => worker.id));
  }, [order.assignedWorkers, order.id]);

  function toggleWorker(workerId: string) {
    setSelectedIds((current) =>
      current.includes(workerId)
        ? current.filter((id) => id !== workerId)
        : [...current, workerId],
    );
  }

  function handleSave() {
    assignMutation.mutate({
      id: order.id,
      input: { workerIds: selectedIds },
    });
  }

  const assignedSummary =
    order.assignedWorkers.length === 0
      ? "Sin asignar"
      : order.assignedWorkers
          .map((worker) => worker.name?.trim() || worker.email)
          .join(", ");

  if (compact) {
    return (
      <div className="flex flex-col gap-2 text-sm">
        <span className="text-[var(--muted)]">{assignedSummary}</span>
        <details className="rounded-lg border border-input p-2">
          <summary className="cursor-pointer font-medium">Asignar operarios</summary>
          <div className="mt-2 flex flex-col gap-2">
            {workers.length === 0 ? (
              <p className="text-xs text-[var(--muted)]">No hay operarios en el sistema.</p>
            ) : (
              workers.map((worker) => (
                <label key={worker.id} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(worker.id)}
                    onChange={() => toggleWorker(worker.id)}
                  />
                  {workerLabel(worker.email, worker.name)}
                </label>
              ))
            )}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={assignMutation.isPending}
              onClick={handleSave}
            >
              {assignMutation.isPending ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </details>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-input p-4">
      <div>
        <p className="text-sm font-semibold">Operarios asignados</p>
        <p className="text-sm text-[var(--muted)]">{assignedSummary}</p>
      </div>
      <div className="flex flex-col gap-2">
        {workers.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No hay operarios registrados.</p>
        ) : (
          workers.map((worker) => (
            <label key={worker.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedIds.includes(worker.id)}
                onChange={() => toggleWorker(worker.id)}
              />
              {workerLabel(worker.email, worker.name)}
            </label>
          ))
        )}
      </div>
      <Button
        type="button"
        variant="secondary"
        disabled={assignMutation.isPending}
        onClick={handleSave}
      >
        {assignMutation.isPending ? "Guardando asignación…" : "Guardar asignación"}
      </Button>
      {assignMutation.isError ? (
        <p className="text-sm text-destructive">
          {assignMutation.error instanceof Error
            ? assignMutation.error.message
            : "No se pudo guardar la asignación."}
        </p>
      ) : null}
    </div>
  );
}
