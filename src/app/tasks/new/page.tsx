import Link from "next/link";

export default function NewTaskPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 px-6 py-12">
      <section className="w-full rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/15 dark:bg-black">
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo pedido</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Esta pantalla sera el formulario real en la tarjeta de conexion con
          API. De momento la dejamos preparada para la estructura del App
          Router.
        </p>

        <form className="mt-8 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="title">
              Titulo del pedido
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className="h-11 w-full rounded-lg border border-black/10 bg-transparent px-3 text-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-500 dark:border-white/15"
              placeholder="Ej: Mesa de comedor en roble"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="description">
              Descripcion
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-500 dark:border-white/15"
              placeholder="Medidas, acabado y notas del cliente"
            />
          </div>
        </form>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 px-4 text-sm font-medium hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/10"
          >
            Volver al listado
          </Link>
          <Link
            href="/tasks/demo-001"
            className="inline-flex h-10 items-center justify-center rounded-full bg-black px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Ir a detalle de ejemplo
          </Link>
        </div>
      </section>
    </main>
  );
}
