import Link from "next/link";
import { notFound } from "next/navigation";

type TaskDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params;

  if (id === "404") {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 px-6 py-12">
      <article className="w-full rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/15 dark:bg-black">
        <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Pedido #{id}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Detalle del pedido
        </h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          Esta ruta usa un segmento dinamico de App Router:
          <code className="ml-1 font-mono">tasks/[id]</code>. En la siguiente
          tarjeta conectaremos datos reales desde la API.
        </p>

        <div className="mt-8 rounded-xl border border-dashed border-black/15 p-4 text-sm dark:border-white/20">
          Prueba manual: visita <code className="font-mono">/tasks/404</code>{" "}
          para ver como se activa <code className="font-mono">not-found.tsx</code>.
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 px-4 text-sm font-medium hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/10"
          >
            Volver al inicio
          </Link>
          <Link
            href="/tasks/new"
            className="inline-flex h-10 items-center justify-center rounded-full bg-black px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Crear nuevo pedido
          </Link>
        </div>
      </article>
    </main>
  );
}
