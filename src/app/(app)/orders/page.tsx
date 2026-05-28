export default function OrdersPage() {
  return (
    <main className="page-shell max-w-6xl items-start">
      <section className="surface-card">
        <header className="mb-8 flex flex-col gap-3 md:mb-10">
          <h1 className="section-heading">Pedidos</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            Listado de pedidos con filtros por estado, cliente y tipo de mueble.
          </p>
        </header>

        <p className="text-sm text-[var(--muted)]">
          Pendiente: integrar tabla/listado conectado a <code>/api/orders</code>.
        </p>
      </section>
    </main>
  );
}
