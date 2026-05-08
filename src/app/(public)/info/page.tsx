const quickGuide = [
  {
    title: "1. Cuentanos tu idea",
    detail: "Definimos estilo, medidas y necesidades reales del espacio.",
  },
  {
    title: "2. Propuesta y planificacion",
    detail: "Preparamos alcance, materiales recomendados y tiempos estimados.",
  },
  {
    title: "3. Fabricacion y entrega",
    detail: "Ejecutamos el proyecto con seguimiento y control de calidad.",
  },
];

export default function InfoPage() {
  return (
    <main className="page-shell max-w-4xl items-start">
      <section className="surface-card content-layout">
        <header className="content-block flex flex-col gap-3">
          <p className="eyebrow">Información útil</p>
          <h1 className="section-heading">Como trabajamos</h1>
          <p className="content-description">
            Este proceso nos permite traducir cada necesidad en una solucion clara, con tiempos
            definidos y foco en acabados duraderos.
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
          <p className="eyebrow">Compromisos</p>
          <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-[var(--muted)]">
            <li>Comunicacion directa durante todo el proyecto.</li>
            <li>Materiales acordes al uso y presupuesto.</li>
            <li>Prioridad en calidad de terminacion y funcionalidad.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
