import Link from "next/link";
import TaskForm from "@/components/tasks/task-form";

export default function NewTaskPage() {
  return (
    <main className="page-shell max-w-4xl">
      <section className="surface-card flex flex-col gap-10 md:gap-12">
        <header className="flex flex-col gap-3">
          <h1 className="section-heading">Nuevo pedido</h1>
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
