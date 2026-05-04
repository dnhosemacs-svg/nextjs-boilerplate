import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import AuthSessionControls from "@/components/auth-session-controls";
import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { listTasksFromCookieStore } from "@/lib/tasks-cookie-store";

export default async function Home() {
  const cookieStore = await cookies();
  const tasks = await listTasksFromCookieStore();
  const isAuthenticated = cookieStore.get(AUTH_COOKIE_NAME)?.value === "1";

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 px-6 py-14 md:py-16">
      <div className="flex w-full flex-col gap-10 rounded-2xl border border-black/10 bg-white p-8 shadow-sm md:gap-12 md:p-10 dark:border-white/15 dark:bg-black">
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Carpintería Tablas y serrín
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Gestiona pedidos desde tu UI de confianza.
          </p>
        </header>

        <AuthSessionControls isAuthenticated={isAuthenticated} />

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

        <div className="flex flex-wrap gap-x-4 gap-y-3">
          <Link
            className="ui-pill ui-pill-primary px-5"
            href="/tasks/new"
          >
            Crear pedido
          </Link>
          <Link
            className="ui-pill ui-pill-secondary px-5"
            href="/stats"
          >
            Ver estadisticas (ISR)
          </Link>
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
                <li
                  key={task.id}
                  className="flex flex-col gap-3 rounded-xl border border-black/10 p-6 dark:border-white/15 md:gap-4 md:p-7"
                >
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
