"use client";

import { OrderForm } from "@/components/orders/order-form";
import { OrderMaterialLinesEditor } from "@/components/orders/order-material-lines-editor";
import { OrderStatusActions } from "@/components/orders/order-status-actions";
import { useOrderQuery } from "@/hooks/orders/use-order-query";
import type { OrderShortageItemDto } from "@/types/order";

type OrderDetailProps = {
  id: string;
};

export function OrderDetail({ id }: OrderDetailProps) {
  const query = useOrderQuery(id);

  if (query.isLoading) {
    return <p className="text-sm text-[var(--muted)]">Cargando pedido...</p>;
  }

  if (query.error) {
    return <p className="text-sm text-destructive">{query.error.message}</p>;
  }

  if (!query.data) {
    return <p className="text-sm text-[var(--muted)]">Pedido no encontrado.</p>;
  }

  const order = query.data;
  const shortages = order.shortages ?? [];

  return (
    <section className="surface-card">
      <header className="mb-8 flex flex-col gap-3 md:mb-10">
        <p className="eyebrow">Pedido #{order.id}</p>
        <h1 className="section-heading">Detalle de pedido</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Estado actual: {order.status}
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Subtotal materiales: {order.materialsSubtotal} EUR
        </p>
      </header>

      <div className="space-y-4">
        <OrderForm mode="edit" order={order} />
        <OrderMaterialLinesEditor order={order} />
        <OrderStatusActions order={order} />

        {order.hasShortages ? (
          <section className="space-y-2 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
            <h2 className="text-sm font-semibold text-destructive">Faltantes detectados</h2>
            {shortages.length === 0 ? (
              <p className="text-xs text-destructive">
                El pedido tiene faltantes pendientes, pero no hay detalle disponible.
              </p>
            ) : (
              <ul className="space-y-1 text-xs text-destructive">
                {shortages.map((item, index) => {
                  const shortage = item as OrderShortageItemDto;
                  return (
                    <li key={`${shortage.materialId}-${index}`}>
                      Material {shortage.materialId}: falta {shortage.missingQty} (planificado{" "}
                      {shortage.plannedQty}, disponible {shortage.availableAtApproval})
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ) : null}
      </div>
    </section>
  );
}
