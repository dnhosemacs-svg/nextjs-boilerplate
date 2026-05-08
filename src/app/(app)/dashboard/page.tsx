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

  return (
    <main className="page-shell max-w-5xl items-start">
      <section className="surface-card content-layout">
        <header className="content-block flex flex-col gap-3">
          <p className="eyebrow">Área privada</p>
          <h1 className="section-heading">Dashboard del taller</h1>
          <p className="content-description">
            Punto de entrada para el equipo autenticado. Desde aquí podés crear pedidos, revisar
            estados y consultar métricas.
          </p>
        </header>

        <div className="content-grid content-block">
          <Link href="/tasks/new" className="content-card">
            <h2 className="text-base font-semibold">Registrar pedido</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Cargar nuevos trabajos con título, descripción y estado inicial.
            </p>
          </Link>

          <Link href="/stats" className="content-card">
            <h2 className="text-base font-semibold">Ver estadísticas</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Consultar la carga actual del taller y el progreso general.
            </p>
          </Link>
        </div>
      </section>

      <section className="surface-card mt-6">
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
          <ul className="flex flex-col gap-3">
            {recentTasks.map((task) => (
              <li key={task.id} className="content-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{task.title}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {formatTaskStatus(task.status)} · {formatRelativeDate(task.updatedAt)}
                    </p>
                  </div>
                  <Link href={`/tasks/${task.id}`} className="ui-link-underline">
                    Ver detalle
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
