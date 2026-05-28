"use client";

import { OrderForm } from "@/components/orders/order-form";
import { useOrderQuery } from "@/hooks/orders/use-order-query";

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

  return (
    <section className="surface-card">
      <header className="mb-8 flex flex-col gap-3 md:mb-10">
        <p className="eyebrow">Pedido #{order.id}</p>
        <h1 className="section-heading">Detalle de pedido</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Estado actual: {order.status}
        </p>
      </header>

      <OrderForm mode="edit" order={order} />
    </section>
  );
}
