import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="w-full max-w-2xl rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/15 dark:bg-black">
        <h1 className="text-3xl font-semibold tracking-tight">
          Carpintería · TaskFlow
        </h1>
        <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
          Proyecto base con App Router. Desde aqui puedes ir al formulario de
          creacion y a una vista de detalle dinamico.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            href="/"
          >
            Inicio
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 px-5 text-sm font-medium hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/10"
            href="/tasks/new"
          >
            Crear pedido
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 px-5 text-sm font-medium hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/10"
            href="/tasks/demo-001"
          >
            Ver detalle de ejemplo
          </Link>
        </div>
      </div>
    </main>
  );
}
