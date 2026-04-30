import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <section className="w-full max-w-xl rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/15 dark:bg-black">
        <h1 className="text-2xl font-semibold tracking-tight">
          Recurso no encontrado
        </h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          La ruta o el pedido que intentaste abrir no existe.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="ui-pill ui-pill-primary"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
