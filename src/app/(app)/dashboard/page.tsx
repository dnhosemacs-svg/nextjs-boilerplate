import Link from "next/link";
import QuickCompleteButton from "@/components/tasks/quick-complete-button";
import StatusBadge from "@/components/tasks/status-badge";
import { listTasksFromCookieStore } from "@/lib/tasks-cookie-store";

function formatRelativeDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";

  const diffInMs = Date.now() - date.getTime();
  const dayMs = 1000 * 60 * 60 * 24;
  const diffInDays = Math.floor(diffInMs / dayMs);

  if (diffInDays <= 0) return "Hoy";
  if (diffInDays === 1) return "Ayer";
  if (diffInDays < 7) return `Hace ${diffInDays} días`;
  return date.toLocaleDateString("es-ES");
}

export default async function DashboardPage() {
  const tasks = await listTasksFromCookieStore();
  const recentTasks = tasks.slice(0, 5);
  const total = tasks.length;
  const pending = tasks.filter((task) => task.status === "pending").length;
  const inProgress = tasks.filter((task) => task.status === "in_progress").length;
  const done = tasks.filter((task) => task.status === "done").length;

  return (
    <main className="page-shell dashboard-shell">
      <div className="dashboard-top">
        <header className="dashboard-hero">
          <h1 className="section-heading">Panel del taller</h1>
          <p className="content-description">
            Vista general para priorizar pedidos, monitorear la carga del equipo y actuar rápido.
          </p>
        </header>

        <section className="dashboard-kpi-grid">
          <article className="dashboard-kpi-card">
            <p className="eyebrow">Total pedidos</p>
            <p className="dashboard-kpi-value">{total}</p>
          </article>
          <article className="dashboard-kpi-card">
            <p className="eyebrow">Pendientes</p>
            <p className="dashboard-kpi-value">{pending}</p>
          </article>
          <article className="dashboard-kpi-card">
            <p className="eyebrow">En proceso</p>
            <p className="dashboard-kpi-value">{inProgress}</p>
          </article>
          <article className="dashboard-kpi-card">
            <p className="eyebrow">Completados</p>
            <p className="dashboard-kpi-value">{done}</p>
          </article>
        </section>
      </div>

      <section className="surface-card dashboard-recent-section">
        <h2 className="section-heading text-3xl dashboard-recent-title">Actividad reciente</h2>

        {recentTasks.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            Aún no hay pedidos cargados. Registra el primero para empezar.
          </p>
        ) : (
          <ul className="dashboard-recent-list">
            {recentTasks.map((task) => (
              <li key={task.id} className="dashboard-recent-item">
                <div>
                  <p className="text-sm font-semibold">{task.title}</p>
                  <div className="dashboard-recent-meta">
                    <StatusBadge status={task.status} />
                    <span className="text-xs text-[var(--muted)]">
                      {formatRelativeDate(task.updatedAt)}
                    </span>
                  </div>
                </div>
                <div className="dashboard-recent-actions">
                  <Link href={`/tasks/${task.id}`} className="ui-link-underline">
                    Ver detalle
                  </Link>
                  <QuickCompleteButton
                    taskId={task.id}
                    isDone={task.status === "done"}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
