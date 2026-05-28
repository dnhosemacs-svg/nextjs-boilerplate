import { OrderForm } from "@/components/orders/order-form";

export default function NewOrderPage() {
  return (
    <main className="page-shell max-w-4xl items-start">
      <section className="surface-card">
        <header className="mb-8 flex flex-col gap-3 md:mb-10">
          <h1 className="section-heading">Nuevo pedido</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            Crea un pedido indicando tipo de mueble, parámetros, notas y cliente.
          </p>
        </header>
        <OrderForm mode="create" />
      </section>
    </main>
  );
}
