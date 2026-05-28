"use client";

import { OrderForm } from "@/components/orders/order-form";
import { OrderMaterialLinesEditor } from "@/components/orders/order-material-lines-editor";
import { OrderStatusActions } from "@/components/orders/order-status-actions";
import { useOrderQuery } from "@/hooks/orders/use-order-query";

type OrderDetailProps = {
  id: string;
  mode?: "internal" | "client";
};

function orderSummaryText(
  furnitureType: string,
  params: Record<string, unknown>,
): string {
  const width = params.ancho ?? params.width;
  const height = params.alto ?? params.height;

  if (width && height) {
    return `${furnitureType} ${width}x${height} cm`;
  }

  return furnitureType;
}

export function OrderDetail({ id, mode = "internal" }: OrderDetailProps) {
  const isClientMode = mode === "client";
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
  const orderParams = (order.params as Record<string, unknown>) ?? {};
  const laborAmount = Number(order.laborAmount ?? "0");
  const materialsSubtotal = Number(order.materialsSubtotal);
  const orderTotal = (materialsSubtotal + laborAmount).toFixed(2);
  const shortages = order.shortages ?? [];

  return (
    <section className="surface-card">
      <header className="mb-8 flex flex-col gap-3 md:mb-10">
        <p className="eyebrow">Pedido #{order.id}</p>
        <h1 className="section-heading">Detalle de pedido</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Estado actual: {order.status}
        </p>
        {isClientMode ? (
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            Resumen: {orderSummaryText(order.furnitureType, orderParams)}
          </p>
        ) : null}
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Subtotal materiales: {order.materialsSubtotal} EUR
        </p>
        {isClientMode && order.laborAmount ? (
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            Mano de obra: {order.laborAmount} EUR
          </p>
        ) : null}
        {isClientMode ? (
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            Total pedido: {orderTotal} EUR
          </p>
        ) : null}
      </header>

      <div className="space-y-4">
        <OrderForm mode="edit" order={order} />
        {isClientMode ? null : <OrderMaterialLinesEditor order={order} />}
        <OrderStatusActions order={order} />

        {!isClientMode && order.hasShortages ? (
          <section className="space-y-2 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
            <h2 className="text-sm font-semibold text-destructive">Faltantes detectados</h2>
            {shortages.length === 0 ? (
              <p className="text-xs text-destructive">
                El pedido tiene faltantes pendientes, pero no hay detalle disponible.
              </p>
            ) : (
              <ul className="space-y-1 text-xs text-destructive">
                {shortages.map((item, index) => {
                  return (
                    <li key={`${item.materialId}-${index}`}>
                      Material {item.materialId}: falta {item.missingQty} (planificado{" "}
                      {item.plannedQty}, disponible {item.availableAtApproval})
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
