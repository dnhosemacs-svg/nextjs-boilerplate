"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateOrderMutation } from "@/hooks/orders/use-order-mutations";
import type { OrderDto } from "@/types/order";
import { UserRole } from "@/types/user-role";

type OrderLaborAmountEditorProps = {
  order: OrderDto;
};

export function OrderLaborAmountEditor({ order }: OrderLaborAmountEditorProps) {
  const { data: session } = useSession();
  const mutation = useUpdateOrderMutation();
  const [laborAmount, setLaborAmount] = useState(order.laborAmount ?? "");

  useEffect(() => {
    setLaborAmount(order.laborAmount ?? "");
  }, [order.laborAmount]);

  const role = session?.user?.role;
  const isWorkshop = role === UserRole.ADMIN || role === UserRole.WORKER;
  const canEdit =
    isWorkshop && (order.status === "READY" || order.status === "DELIVERED");

  if (!canEdit) {
    return null;
  }

  function handleSave() {
    const parsed = Number(laborAmount);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return;
    }

    mutation.mutate({
      id: order.id,
      input: { laborAmount: parsed },
    });
  }

  return (
    <section className="space-y-3 rounded-lg border border-border p-4">
      <h2 className="text-sm font-semibold">Cierre de entrega</h2>
      <label className="text-xs text-[var(--muted)]" htmlFor={`labor-${order.id}`}>
        Mano de obra (EUR)
      </label>
      <Input
        id={`labor-${order.id}`}
        type="number"
        min="0"
        step="0.01"
        value={laborAmount}
        onChange={(e) => setLaborAmount(e.target.value)}
        placeholder="0.00"
      />
      <p className="text-xs text-[var(--muted)]">
        Total estimado: {order.totalAmount} EUR (materiales + mano de obra guardada)
      </p>
      <Button type="button" disabled={mutation.isPending} onClick={handleSave}>
        {mutation.isPending ? "Guardando..." : "Guardar mano de obra"}
      </Button>
      {mutation.error ? (
        <p className="text-xs text-destructive">{mutation.error.message}</p>
      ) : null}
    </section>
  );
}
