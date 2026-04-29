import Image from "next/image";
import Link from "next/link";
import { getTasksServer } from "@/lib/api-server";

export default async function Home() {
  const tasks = await getTasksServer();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 px-6 py-12">
      <div className="w-full rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/15 dark:bg-black">
        <h1 className="text-3xl font-semibold tracking-tight">
          Carpintería · TaskFlow
        </h1>
        <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
          Gestiona pedidos desde una UI conectada a Route Handlers con App Router.
        </p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-black/10 dark:border-white/15">
          <Image
            src="/carpentry-hero.svg"
            alt="Banco de trabajo de carpinteria con herramientas"
            width={1200}
            height={630}
            priority
            className="h-auto w-full"
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            href="/tasks/new"
          >
            Crear pedido
          </Link>
        </div>

        <section className="mt-8">
          <h2 className="text-lg font-medium">Pedidos</h2>
          {tasks.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              No hay pedidos todavia.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="rounded-xl border border-black/10 p-4 dark:border-white/15"
                >
                  <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {task.status}
                  </p>
                  <h3 className="mt-1 text-base font-medium">{task.title}</h3>
                  {task.description ? (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {task.description}
                    </p>
                  ) : null}
                  <Link
                    href={`/tasks/${task.id}`}
                    className="mt-3 inline-flex text-sm font-medium underline underline-offset-4"
                  >
                    Ver detalle
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
