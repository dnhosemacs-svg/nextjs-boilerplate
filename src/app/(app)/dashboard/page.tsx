import Link from "next/link";
import { listTasksFromCookieStore } from "@/lib/tasks-cookie-store";
import { formatTaskStatus } from "@/lib/task-status";

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
    <main className="page-shell dashboard-shell items-start">
      <header className="dashboard-hero">
        <div>
          <p className="eyebrow">Panel operativo</p>
          <h1 className="section-heading">Dashboard del taller</h1>
          <p className="content-description">
            Vista general para priorizar pedidos, monitorear la carga del equipo y actuar rápido.
          </p>
        </div>
        <div className="dashboard-hero-actions">
          <Link href="/stats" className="ui-pill ui-pill-secondary">
            Ver métricas
          </Link>
          <Link href="/tasks/new" className="ui-pill ui-pill-primary">
            Crear pedido
          </Link>
        </div>
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

      <section className="surface-card">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="section-heading text-3xl">Actividad reciente</h2>
          <Link href="/tasks/new" className="ui-pill ui-pill-primary">
            Nuevo pedido
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            Aún no hay pedidos cargados. Registrá el primero para empezar.
          </p>
        ) : (
          <ul className="dashboard-recent-list">
            {recentTasks.map((task) => (
              <li key={task.id} className="dashboard-recent-item">
                <div>
                  <p className="text-sm font-semibold">{task.title}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {formatTaskStatus(task.status)} · {formatRelativeDate(task.updatedAt)}
                  </p>
                </div>
                <Link href={`/tasks/${task.id}`} className="ui-link-underline">
                  Ver detalle
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
