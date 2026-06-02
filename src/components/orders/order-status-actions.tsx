"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useTransitionOrderStatusMutation } from "@/hooks/orders/use-order-mutations";
import { formatOrderStatus } from "@/lib/order-status";
import { getOrderTransitionTargets } from "@/lib/order-transitions";
import type { OrderDto } from "@/types/order";
import type { OrderStatus } from "@/types/order-status";
import { UserRole } from "@/types/user-role";

type OrderStatusAction = {
  label: string;
  status: OrderStatus;
  variant?: "default" | "destructive";
};

type OrderStatusActionsProps = {
  order: OrderDto;
};

function actionLabel(from: OrderStatus, to: OrderStatus): string {
  if (from === "CANCELLED") {
    return `Reactivar como ${formatOrderStatus(to).toLowerCase()}`;
  }
  if (to === "DELIVERED") return "Completar pedido";
  if (to === "CANCELLED") return "Cancelar";
  if (to === "PENDING" && from === "DRAFT") return "Enviar";
  if (to === "APPROVED") return "Aprobar";
  if (to === "IN_PRODUCTION") return "En producción";
  if (to === "READY") return "Marcar listo";
  return formatOrderStatus(to);
}

function workerActions(order: OrderDto, role: UserRole): OrderStatusAction[] {
  return getOrderTransitionTargets(order.status, role).map((status) => ({
    label: actionLabel(order.status, status),
    status,
    variant: status === "CANCELLED" ? "destructive" : "default",
  }));
}

function AdminStatusEditor({ order }: { order: OrderDto }) {
  const mutation = useTransitionOrderStatusMutation();
  const targets = getOrderTransitionTargets(order.status, UserRole.ADMIN);
  const [selected, setSelected] = useState<OrderStatus | "">("");

  if (targets.length === 0) {
    return (
      <p className="mt-2 text-xs text-[var(--muted)]">
        No hay cambios de estado disponibles para este pedido.
      </p>
    );
  }

  function apply() {
    if (!selected) return;
    mutation.mutate(
      { id: order.id, status: selected },
      { onSuccess: () => setSelected("") },
    );
  }

  return (
    <div className="mt-3 flex flex-wrap items-end gap-2">
      <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs text-[var(--muted)]">
        Nuevo estado
        <select
          value={selected}
          disabled={mutation.isPending}
          onChange={(event) => setSelected(event.target.value as OrderStatus | "")}
          className="warm-native-select h-9 rounded-lg border border-input px-2 text-sm text-[var(--foreground)] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          <option value="">Seleccionar…</option>
          {targets.map((status) => (
            <option key={status} value={status}>
              {actionLabel(order.status, status)}
            </option>
          ))}
        </select>
      </label>
      <Button
        type="button"
        variant={selected === "CANCELLED" ? "destructive" : "default"}
        disabled={!selected || mutation.isPending}
        onClick={apply}
      >
        {mutation.isPending ? "Aplicando…" : "Aplicar"}
      </Button>
    </div>
  );
}

function WorkerStatusActions({ order, role }: { order: OrderDto; role: UserRole }) {
  const mutation = useTransitionOrderStatusMutation();
  const actions = workerActions(order, role);

  if (actions.length === 0) {
    return (
      <p className="mt-2 text-xs text-[var(--muted)]">
        No hay acciones disponibles en esta etapa.
      </p>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button
          key={action.status}
          type="button"
          variant={action.variant ?? "default"}
          disabled={mutation.isPending}
          onClick={() => mutation.mutate({ id: order.id, status: action.status })}
        >
          {mutation.isPending ? "Aplicando…" : action.label}
        </Button>
      ))}
    </div>
  );
}

export function OrderStatusActions({ order }: OrderStatusActionsProps) {
  const { data: session } = useSession();
  const mutation = useTransitionOrderStatusMutation();
  const role = session?.user?.role;
  const isAdmin = role === UserRole.ADMIN;

  if (!role) return null;

  return (
    <section className="space-y-1 rounded-lg border border-border p-4">
      <h2 className="text-sm font-semibold">Acciones de estado</h2>
      <p className="text-xs text-[var(--muted)]">
        Estado actual: {formatOrderStatus(order.status)}
      </p>

      {isAdmin ? (
        <AdminStatusEditor order={order} />
      ) : (
        <WorkerStatusActions order={order} role={role} />
      )}

      {mutation.error ? (
        <p className="text-xs text-destructive">{mutation.error.message}</p>
      ) : null}
    </section>
  );
}
