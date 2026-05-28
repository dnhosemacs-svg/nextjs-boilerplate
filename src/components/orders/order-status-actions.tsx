"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useTransitionOrderStatusMutation } from "@/hooks/orders/use-order-mutations";
import { canChangeOrderStatus } from "@/lib/permissions";
import type { OrderDto } from "@/types/order";
import type { OrderStatus } from "@/types/order-status";

type OrderStatusAction = {
  label: string;
  status: OrderStatus;
  variant?: "default" | "destructive";
};

type OrderStatusActionsProps = {
  order: OrderDto;
};

function availableActions(order: OrderDto): OrderStatusAction[] {
  switch (order.status) {
    case "DRAFT":
      return [
        { label: "Enviar", status: "PENDING" },
        { label: "Cancelar", status: "CANCELLED", variant: "destructive" },
      ];
    case "PENDING":
      return [
        { label: "Aprobar", status: "APPROVED" },
        { label: "Cancelar", status: "CANCELLED", variant: "destructive" },
      ];
    case "APPROVED":
      return [
        { label: "En produccion", status: "IN_PRODUCTION" },
        { label: "Cancelar", status: "CANCELLED", variant: "destructive" },
      ];
    case "IN_PRODUCTION":
      return [
        { label: "Marcar listo", status: "READY" },
        { label: "Cancelar", status: "CANCELLED", variant: "destructive" },
      ];
    case "READY":
      return [{ label: "Marcar entregado", status: "DELIVERED" }];
    default:
      return [];
  }
}

export function OrderStatusActions({ order }: OrderStatusActionsProps) {
  const { data: session } = useSession();
  const mutation = useTransitionOrderStatusMutation();
  const userRole = session?.user?.role;
  const actions = userRole
    ? availableActions(order).filter((action) =>
        canChangeOrderStatus(userRole, order.status, action.status),
      )
    : [];

  if (actions.length === 0) {
    return (
      <section className="rounded-lg border border-border p-4">
        <h2 className="text-sm font-semibold">Acciones de estado</h2>
        <p className="mt-2 text-xs text-[var(--muted)]">
          No hay transiciones habilitadas en esta etapa para el estado actual.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-lg border border-border p-4">
      <h2 className="text-sm font-semibold">Acciones de estado</h2>

      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            type="button"
            variant={action.variant ?? "default"}
            disabled={mutation.isPending}
            onClick={() => mutation.mutate({ id: order.id, status: action.status })}
          >
            {mutation.isPending ? "Aplicando..." : action.label}
          </Button>
        ))}
      </div>

      {mutation.error ? <p className="text-xs text-destructive">{mutation.error.message}</p> : null}
    </section>
  );
}
