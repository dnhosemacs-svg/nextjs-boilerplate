import Link from "next/link";
import { listTasksFromCookieStore } from "@/lib/tasks-cookie-store";

export default async function StatsPage() {
  const tasks = await listTasksFromCookieStore();
  const total = tasks.length;
  const pending = tasks.filter((task) => task.status === "pending").length;
  const inProgress = tasks.filter((task) => task.status === "in_progress").length;
  const done = tasks.filter((task) => task.status === "done").length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
  const statCards = [
    { label: "Total pedidos", value: total },
    { label: "Pendientes", value: pending },
    { label: "En proceso", value: inProgress },
    { label: "Terminados", value: done },
  ];

  return (
    <main className="page-shell max-w-4xl items-start">
      <section className="surface-card stats-layout">
        <header className="stats-block flex flex-col gap-3">
          <p className="eyebrow">Resumen operativo</p>
          <h1 className="section-heading">Estadísticas del taller</h1>
          <p className="stats-description">
            Estado actual de los pedidos para planificar carga de trabajo y prioridades del equipo.
          </p>
        </header>

        <div className="stats-grid stats-block">
          {statCards.map((card) => (
            <article
              key={card.label}
              className="stats-card"
            >
              <p className="eyebrow">{card.label}</p>
              <p className="stats-value">
                {card.value}
              </p>
            </article>
          ))}
        </div>

        <article className="stats-highlight stats-block">
          <p className="eyebrow">Rendimiento</p>
          <p className="stats-highlight-label">
            Tasa de finalización actual:
          </p>
          <p className="stats-highlight-value">{completionRate}%</p>
        </article>

        <div>
          <Link
            href="/"
            className="ui-pill ui-pill-secondary"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
