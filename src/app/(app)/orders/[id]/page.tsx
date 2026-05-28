type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  return (
    <main className="page-shell max-w-4xl items-start">
      <section className="surface-card">
        <header className="mb-8 flex flex-col gap-3 md:mb-10">
          <p className="eyebrow">Pedido #{id}</p>
          <h1 className="section-heading">Detalle de pedido</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            Consulta y edición del pedido según rol y ownership.
          </p>
        </header>

        <p className="text-sm text-[var(--muted)]">
          Pendiente: integrar detalle conectado a <code>GET/PATCH /api/orders/[id]</code>.
        </p>
      </section>
    </main>
  );
}
