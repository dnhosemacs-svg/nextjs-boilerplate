import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteTaskButton from "@/components/tasks/delete-task-button";
import TaskForm from "@/components/tasks/task-form";
import { getTaskByIdFromCookieStore } from "@/lib/tasks-cookie-store";

type TaskDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: TaskDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const task = await getTaskByIdFromCookieStore(id).catch(() => null);

  if (!task) {
    return {
      title: "Pedido no encontrado | Carpinteria TaskFlow",
      description: "El pedido solicitado no existe o ha sido eliminado.",
    };
  }

  return {
    title: `${task.title} | Carpinteria TaskFlow`,
    description:
      task.description?.slice(0, 140) ??
      `Detalle del pedido ${task.id} en el gestor de carpinteria.`,
  };
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params;
  const task = await getTaskByIdFromCookieStore(id).catch(() => null);
  if (!task) {
    notFound();
  }

  return (
    <main className="page-shell max-w-4xl">
      <article className="surface-card flex flex-col gap-10 md:gap-12">
        <header className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Pedido #{task.id}
          </p>
          <h1 className="section-heading">{task.title}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Estado actual: <strong>{task.status}</strong>
          </p>
          {task.description ? (
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {task.description}
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Sin descripción.
            </p>
          )}
        </header>

        <div className="rounded-xl border border-dashed border-black/15 p-4 text-sm leading-relaxed dark:border-white/20 md:p-5">
          Creado: {new Date(task.createdAt).toLocaleString()} · Actualizado:{" "}
          {new Date(task.updatedAt).toLocaleString()}
        </div>

        <TaskForm mode="edit" initialData={task} />

        <div className="task-detail-secondary-actions flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <Link href="/" className="ui-pill ui-pill-secondary self-start sm:self-auto">
            Volver al inicio
          </Link>
          <Link href="/tasks/new" className="ui-pill ui-pill-primary self-start sm:self-auto">
            Crear nuevo pedido
          </Link>
          <DeleteTaskButton taskId={task.id} />
        </div>
      </article>
    </main>
  );
}
