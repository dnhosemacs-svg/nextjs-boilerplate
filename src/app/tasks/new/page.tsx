import Link from "next/link";
import TaskForm from "@/components/tasks/task-form";

export default function NewTaskPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 px-6 py-12">
      <section className="w-full rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/15 dark:bg-black">
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo pedido</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Completa los datos para crear un nuevo pedido de carpinteria.
        </p>

        <TaskForm mode="create" />

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 px-4 text-sm font-medium hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/10"
          >
            Volver al listado
          </Link>
        </div>
      </section>
    </main>
  );
}
