import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteTaskButton from "@/components/tasks/delete-task-button";
import TaskForm from "@/components/tasks/task-form";
import { getTaskById } from "@/lib/api";

type TaskDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params;
  const task = await getTaskById(id).catch(() => null);
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
          <DeleteTaskButton taskId={task.id} />
        </div>
      </article>
    </main>
  );
}
