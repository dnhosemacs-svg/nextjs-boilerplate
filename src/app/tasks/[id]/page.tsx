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
    <main className="mx-auto flex w-full max-w-3xl flex-1 px-6 py-12">
      <article className="w-full rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/15 dark:bg-black">
        <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Pedido #{task.id}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {task.title}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Estado actual: <strong>{task.status}</strong>
        </p>
        {task.description ? (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            {task.description}
          </p>
        ) : (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Sin descripcion.
          </p>
        )}

        <div className="mt-8 rounded-xl border border-dashed border-black/15 p-4 text-sm dark:border-white/20">
          Creado: {new Date(task.createdAt).toLocaleString()} · Actualizado:{" "}
          {new Date(task.updatedAt).toLocaleString()}
        </div>

        <TaskForm mode="edit" initialData={task} />

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="ui-pill ui-pill-secondary"
          >
            Volver al inicio
          </Link>
          <Link
            href="/tasks/new"
            className="ui-pill ui-pill-primary"
          >
            Crear nuevo pedido
          </Link>
          <DeleteTaskButton taskId={task.id} />
        </div>
      </article>
    </main>
  );
}
