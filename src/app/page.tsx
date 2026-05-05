import Image from "next/image";
import Link from "next/link";
import { listTasksFromCookieStore } from "@/lib/tasks-cookie-store";

export default async function Home() {
  const tasks = await listTasksFromCookieStore();

  return (
    <main className="page-shell max-w-5xl">
      <div className="surface-card flex flex-col gap-10 md:gap-12">
        <header className="flex flex-col gap-3">
          <h1 className="section-heading text-3xl">
            Carpintería Tablas y serrín
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Gestiona pedidos desde tu UI de confianza.
          </p>
        </header>

        <div className="overflow-hidden rounded-2xl border border-black/10 dark:border-white/15">
          <Image
            src="/Portada.webp"
            alt="Banco de trabajo de carpinteria con herramientas"
            width={1200}
            height={630}
            priority
            className="h-auto w-full"
          />
        </div>

        <section className="flex flex-col gap-6 md:gap-8">
          <h2 className="text-lg font-medium">Pedidos</h2>
          {tasks.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No hay pedidos todavia.
            </p>
          ) : (
            <ul className="flex flex-col gap-6 md:gap-8">
              {tasks.map((task) => (
                <li key={task.id} className="surface-card flex flex-col gap-3 p-6 md:gap-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {task.status}
                  </p>
                  <h3 className="text-base font-medium leading-snug">{task.title}</h3>
                  {task.description ? (
                    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {task.description}
                    </p>
                  ) : null}
                  <Link
                    href={`/tasks/${task.id}`}
                    className="ui-link-underline inline-flex pt-1"
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
