import Link from "next/link";
import { listTasks } from "@/lib/tasks-repository";
import type { Task } from "@/types/task";

export const revalidate = 60;

export default async function StatsPage() {
  let tasks: Task[] = [];
  let dbUnavailable = false;
  try {
    tasks = await listTasks();
  } catch {
    dbUnavailable = true;
  }

  const total = tasks.length;
  const pending = tasks.filter((task) => task.status === "pending").length;
  const inProgress = tasks.filter((task) => task.status === "in_progress").length;
  const done = tasks.filter((task) => task.status === "done").length;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 px-6 py-12">
      <section className="w-full rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/15 dark:bg-black">
        <h1 className="text-2xl font-semibold tracking-tight">
          Estadisticas (ISR)
        </h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          Esta pagina usa Incremental Static Regeneration con revalidacion cada{" "}
          <strong>{revalidate}s</strong>.
        </p>
        {dbUnavailable ? (
          <p className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
            No fue posible conectar con MongoDB en este momento. Se muestran
            estadisticas vacias hasta la siguiente revalidacion.
          </p>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <article className="rounded-xl border border-black/10 p-4 dark:border-white/15">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Total pedidos
            </p>
            <p className="mt-1 text-3xl font-semibold">{total}</p>
          </article>
          <article className="rounded-xl border border-black/10 p-4 dark:border-white/15">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Pendientes
            </p>
            <p className="mt-1 text-3xl font-semibold">{pending}</p>
          </article>
          <article className="rounded-xl border border-black/10 p-4 dark:border-white/15">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              En proceso
            </p>
            <p className="mt-1 text-3xl font-semibold">{inProgress}</p>
          </article>
          <article className="rounded-xl border border-black/10 p-4 dark:border-white/15">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Terminados
            </p>
            <p className="mt-1 text-3xl font-semibold">{done}</p>
          </article>
        </div>

        <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
          Nota: en este proyecto las tareas viven en cookie por sesion, asi que esta
          demo de ISR esta orientada a aprendizaje de cache y regeneracion.
        </p>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 px-4 text-sm font-medium hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/10"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
