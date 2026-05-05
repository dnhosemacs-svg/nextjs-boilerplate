import Link from "next/link";

import { listTasksFromCookieStore } from "@/lib/tasks-cookie-store";

export default async function StatsPage() {
  const tasks = await listTasksFromCookieStore();
  const total = tasks.length;
  const pending = tasks.filter((task) => task.status === "pending").length;
  const inProgress = tasks.filter((task) => task.status === "in_progress").length;
  const done = tasks.filter((task) => task.status === "done").length;

  return (
    <main className="page-shell max-w-4xl">
      <section className="surface-card">
        <h1 className="section-heading">Estadísticas</h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-black/10 bg-white/40 p-5 dark:border-white/15 dark:bg-white/5">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Total pedidos
            </p>
            <p className="mt-1 text-3xl font-semibold">{total}</p>
          </article>
          <article className="rounded-xl border border-black/10 bg-white/40 p-5 dark:border-white/15 dark:bg-white/5">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Pendientes
            </p>
            <p className="mt-1 text-3xl font-semibold">{pending}</p>
          </article>
          <article className="rounded-xl border border-black/10 bg-white/40 p-5 dark:border-white/15 dark:bg-white/5">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              En proceso
            </p>
            <p className="mt-1 text-3xl font-semibold">{inProgress}</p>
          </article>
          <article className="rounded-xl border border-black/10 bg-white/40 p-5 dark:border-white/15 dark:bg-white/5">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Terminados
            </p>
            <p className="mt-1 text-3xl font-semibold">{done}</p>
          </article>
        </div>

        <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
          Nota: en este proyecto las tareas viven en cookie por sesion.
        </p>

        <div className="mt-6">
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
