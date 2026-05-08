const principles = [
  "Priorizar claridad operativa antes que complejidad técnica innecesaria.",
  "Centralizar la información de pedidos para evitar reprocesos en el taller.",
  "Mantener una interfaz rápida, legible y coherente para uso diario del equipo.",
];

export default function AboutPage() {
  return (
    <main className="page-shell max-w-4xl items-start">
      <section className="surface-card content-layout">
        <header className="content-block flex flex-col gap-3">
          <p className="eyebrow">Sobre el proyecto</p>
          <h1 className="section-heading">Quiénes somos y cómo trabajamos</h1>
          <p className="content-description">
            Este panel nace como herramienta interna para organizar pedidos de carpintería,
            mejorar la trazabilidad del trabajo y facilitar decisiones del día a día.
          </p>
        </header>

        <div className="content-grid content-block">
          {principles.map((item) => (
            <article
              key={item}
              className="content-card"
            >
              <p className="text-sm leading-relaxed text-[var(--foreground)]">{item}</p>
            </article>
          ))}
        </div>

        <article className="content-highlight content-block">
          <p className="eyebrow">Estado actual</p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            Actualmente esta versión está orientada a equipos pequeños y procesos simples.
            Próximamente incorporará autenticación por usuario, control de permisos y evolución del
            módulo de estadísticas.
          </p>
        </article>
      </section>
    </main>
  );
}
