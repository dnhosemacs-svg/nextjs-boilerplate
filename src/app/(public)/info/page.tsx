const quickGuide = [
  {
    title: "1. Registrar pedido",
    detail: "Usa “Nuevo pedido” para cargar título, descripción y estado inicial.",
  },
  {
    title: "2. Actualizar progreso",
    detail: "Desde cada detalle de pedido, modifica estado y datos relevantes.",
  },
  {
    title: "3. Revisar métricas",
    detail: "Consulta “Estadísticas” para visualizar carga actual y avance.",
  },
];

export default function InfoPage() {
  return (
    <main className="page-shell max-w-4xl items-start">
      <section className="surface-card content-layout">
        <header className="content-block flex flex-col gap-3">
          <p className="eyebrow">Información útil</p>
          <h1 className="section-heading">Guía rápida de uso</h1>
          <p className="content-description">
            Esta página resume cómo usar el sistema en el flujo diario del taller para mantener
            consistencia en pedidos y seguimiento.
          </p>
        </header>

        <div className="content-grid content-block">
          {quickGuide.map((step) => (
            <article
              key={step.title}
              className="content-card"
            >
              <h2 className="text-base font-semibold">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{step.detail}</p>
            </article>
          ))}
        </div>

        <article className="content-highlight content-block">
          <p className="eyebrow">Notas</p>
          <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-[var(--muted)]">
            <li>Los datos actuales se guardan por sesión en cookie.</li>
            <li>Evita títulos ambiguos; describe pieza y prioridad.</li>
            <li>Revisa periódicamente pedidos finalizados para mantener limpieza operativa.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
