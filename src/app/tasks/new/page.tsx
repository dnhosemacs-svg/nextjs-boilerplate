import Link from "next/link";
import TaskForm from "@/components/tasks/task-form";

export default function NewTaskPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 px-6 py-14 md:py-16">
      <section className="flex w-full flex-col gap-10 rounded-2xl border border-black/10 bg-white p-8 shadow-sm md:gap-12 md:p-10 dark:border-white/15 dark:bg-black">
        <header className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Nuevo pedido</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Completa los datos para crear un nuevo pedido de carpintería.
          </p>
        </header>

        <TaskForm mode="create" />

        <div className="flex flex-col gap-4">
          <Link href="/" className="ui-pill ui-pill-secondary self-start">
            Volver al listado
          </Link>
        </div>
      </section>
    </main>
  );
}
