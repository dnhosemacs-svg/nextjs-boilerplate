import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { formatTaskStatus } from "@/lib/task-status";
import { listTasksFromCookieStore } from "@/lib/tasks-cookie-store";
import StatusBadge from "@/components/tasks/status-badge";
import type { TaskStatus } from "@/types/task";

const galleryItems = [
  {
    title: "Mesa roble — referencia de acabado",
    place: "Catálogo interno / muestra",
    src: "https://images.pexels.com/photos/4985341/pexels-photo-4985341.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Mesa de madera sólida, referencia visual para pedidos del taller",
  },
  {
    title: "Mobiliario en almacén",
    place: "Piezas terminadas o en espera",
    src: "https://images.pexels.com/photos/5825540/pexels-photo-5825540.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Cómoda de madera en espacio de taller o almacén",
  },
  {
    title: "Prototipo / pieza tipo",
    place: "Banco de ideas del equipo",
    src: "https://images.pexels.com/photos/963486/pexels-photo-963486.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Silla de madera minimalista como referencia de diseño",
  },
];

type HomePageProps = {
  searchParams: Promise<{ status?: string }>;
};

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

function isTaskStatus(value: string | undefined): value is TaskStatus {
  return value === "pending" || value === "in_progress" || value === "done";
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const selectedStatus = isTaskStatus(params.status) ? params.status : "all";
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get(AUTH_COOKIE_NAME)?.value === "1";
  const tasks = isAuthenticated ? await listTasksFromCookieStore() : [];
  const filteredTasks =
    selectedStatus === "all" ? tasks : tasks.filter((task) => task.status === selectedStatus);

  const statusFilters: Array<{ value: "all" | TaskStatus; label: string; count: number }> = [
    { value: "all", label: "Todos", count: tasks.length },
    {
      value: "pending",
      label: formatTaskStatus("pending"),
      count: tasks.filter((task) => task.status === "pending").length,
    },
    {
      value: "in_progress",
      label: formatTaskStatus("in_progress"),
      count: tasks.filter((task) => task.status === "in_progress").length,
    },
    {
      value: "done",
      label: formatTaskStatus("done"),
      count: tasks.filter((task) => task.status === "done").length,
    },
  ];

  return (
    <main className="page-shell">
      <div className="flex w-full flex-col gap-8 md:gap-12">
        <section className="surface-card relative overflow-hidden p-0">
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />
          <Image
            src="https://images.pexels.com/photos/5974335/pexels-photo-5974335.jpeg?auto=compress&cs=tinysrgb&w=2000"
            alt="Carpintero trabajando una pieza de madera en su taller"
            width={2000}
            height={1200}
            priority
            sizes="(max-width: 768px) 100vw, 1100px"
            className="h-[66svh] min-h-[460px] w-full object-cover object-center"
          />
          <div className="absolute inset-x-3 bottom-3 z-20 p-6 sm:inset-x-5 sm:bottom-5 sm:p-8 md:inset-x-6 md:bottom-6 md:p-12">
            <p className="eyebrow mb-3 !text-white/90 drop-shadow-sm">
              Uso interno del taller
            </p>
            <h1 className="display-heading max-w-3xl text-4xl text-[var(--surface)] sm:text-5xl md:text-6xl">
              Panel del taller: pedidos, seguimiento y trabajo del día.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[rgb(251_247_241/0.88)] sm:text-base">
              Herramienta para el equipo: registrar trabajos, ver el estado de cada pedido y
              consultar el resumen desde un solo sitio. No es una tienda para clientes finales.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/tasks/new" className="ui-pill ui-pill-primary">
                Nuevo pedido
              </Link>
              <Link
                href="/stats"
                className="ui-pill border border-white/70 bg-black/20 !text-white/95 shadow-sm backdrop-blur-md hover:border-white/85 hover:bg-black/30"
              >
                Estadísticas
              </Link>
            </div>
          </div>
        </section>

        <section>
          <article className="surface-card presentation-card">
            <p className="eyebrow">Flujo en el taller</p>
            <h2 className="section-heading max-w-xl">
              Cómo encaja esta app en el día a día del equipo.
            </h2>
            <p className="text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              Cada pedido lo crea alguien del taller cuando entra un trabajo nuevo. Así todos
              ven el mismo estado, las notas y el detalle sin depender de papel suelto o grupos
              de mensajes.
            </p>
            <ul className="mt-1 grid gap-3 text-sm text-[var(--foreground)] sm:grid-cols-3">
              <li className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                Registrar pedido y prioridad
              </li>
              <li className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                Seguimiento en fabricación
              </li>
              <li className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                Cierre y revisión en lista
              </li>
            </ul>
          </article>
        </section>

        {isAuthenticated ? (
          <section className="surface-card">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Pedidos del taller</p>
                <h2 className="section-heading text-3xl">Lista activa</h2>
              </div>
              <Link href="/tasks/new" className="ui-pill ui-pill-primary shrink-0">
                Registrar pedido
              </Link>
            </div>
            <p className="mb-6 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              Trabajos registrados por el equipo. Consulta el detalle para actualizar estado o notas.
            </p>

            {tasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface-strong)] p-6">
                <p className="text-sm text-[var(--muted)]">
                  Todavía no hay pedidos registrados. Crea el primero para empezar a organizar la
                  carga del taller.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-5 flex flex-wrap gap-2.5">
                  {statusFilters.map((filter) => {
                    const isActive = selectedStatus === filter.value;
                    const href = filter.value === "all" ? "/" : `/?status=${filter.value}`;
                    return (
                      <Link
                        key={filter.value}
                        href={href}
                        aria-current={isActive ? "page" : undefined}
                        className={`status-filter-pill ${isActive ? "status-filter-pill--active" : ""}`}
                      >
                        {filter.label}
                        <span className="status-filter-count">{filter.count}</span>
                      </Link>
                    );
                  })}
                </div>

                {filteredTasks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface-strong)] p-6">
                    <p className="text-sm text-[var(--muted)]">
                      No hay pedidos en este estado. Prueba otro filtro o crea uno nuevo.
                    </p>
                  </div>
                ) : (
                  <div className="task-table-wrap">
                    <table className="task-table">
                      <thead>
                        <tr>
                          <th>Pedido</th>
                          <th>Estado</th>
                          <th>Actualizado</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTasks.map((task) => (
                          <tr key={task.id}>
                            <td>
                              <p className="text-sm font-semibold leading-snug">{task.title}</p>
                              <p className="mt-1 text-xs text-[var(--muted)]">
                                {task.description?.slice(0, 96) ?? "Sin descripción"}
                              </p>
                            </td>
                            <td>
                              <StatusBadge status={task.status} />
                            </td>
                            <td className="text-sm text-[var(--muted)]">
                              {formatRelativeDate(task.updatedAt)}
                            </td>
                            <td>
                              <Link href={`/tasks/${task.id}`} className="ui-link-underline">
                                Ver detalle
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </section>
        ) : null}

        <section className="surface-card">
          <div className="mb-6">
            <div>
              <p className="eyebrow">Referencia visual</p>
              <h2 className="section-heading">Inspiración y acabados</h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {galleryItems.map((item) => (
              <article
                key={item.title}
                className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={1200}
                  height={900}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="p-4">
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">{item.place}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="surface-card warm-gradient relative overflow-hidden">
          <div className="soft-grid pointer-events-none absolute inset-0 opacity-50" />
          <div className="relative z-10 grid gap-6 md:grid-cols-[1.15fr_1fr] md:items-center">
            <div>
              <p className="eyebrow">Acciones rápidas</p>
              <h2 className="section-heading mt-2 max-w-xl">
                ¿Entró un trabajo nuevo? Dejalo cargado antes de que pase a la mesa.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                Un pedido bien cargado al inicio evita reprocesos: cliente interno o externo,
                pieza, medidas y plazo en un solo lugar para todo el equipo.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/tasks/new" className="ui-pill ui-pill-primary">
                  Cargar pedido
                </Link>
                <Link href="/stats" className="ui-pill ui-pill-secondary">
                  Ver resumen
                </Link>
              </div>
            </div>

            <article className="overflow-hidden rounded-2xl border border-[var(--line)]">
              <Image
                src="https://images.pexels.com/photos/17649488/pexels-photo-17649488.jpeg?auto=compress&cs=tinysrgb&w=1400"
                alt="Operario transportando tablones de madera en taller"
                width={1400}
                height={933}
                sizes="(max-width: 768px) 100vw, 40vw"
                className="h-60 w-full object-cover md:h-[300px]"
              />
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
