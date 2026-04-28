"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createTask, updateTask } from "@/lib/api";
import type { CreateTaskInput, UpdateTaskInput } from "@/lib/validators/task";
import type { Task, TaskStatus } from "@/types/task";

type TaskFormProps = {
  mode: "create" | "edit";
  initialData?: Task;
};

const statusOptions: Array<{ value: TaskStatus; label: string }> = [
  { value: "pending", label: "Pendiente" },
  { value: "in_progress", label: "En progreso" },
  { value: "done", label: "Completada" },
];

export default function TaskForm({ mode, initialData }: TaskFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(initialData?.status ?? "pending");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heading = useMemo(
    () => (mode === "create" ? "Crear pedido" : "Editar pedido"),
    [mode],
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        const payload: CreateTaskInput = {
          title,
          description: description.trim() ? description : undefined,
          status,
        };

        const created = await createTask(payload);
        router.push(`/tasks/${created.id}`);
        return;
      }

      if (!initialData) {
        throw new Error("Faltan datos iniciales para editar.");
      }

      const payload: UpdateTaskInput = {
        title,
        description: description.trim() ? description : undefined,
        status,
      };

      await updateTask(initialData.id, payload);
      router.refresh();
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Error inesperado";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={onSubmit}>
      <h2 className="text-lg font-medium">{heading}</h2>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="title">
          Titulo del pedido
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
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
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-500 dark:border-white/15"
          placeholder="Medidas, acabado y notas del cliente"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="status">
          Estado
        </label>
        <select
          id="status"
          name="status"
          value={status}
          onChange={(event) => setStatus(event.target.value as TaskStatus)}
          className="h-11 w-full rounded-lg border border-black/10 bg-transparent px-3 text-sm outline-none ring-0 focus:border-zinc-500 dark:border-white/15"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-10 items-center justify-center rounded-full bg-black px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {isSubmitting
          ? "Guardando..."
          : mode === "create"
            ? "Crear pedido"
            : "Guardar cambios"}
      </button>
    </form>
  );
}
