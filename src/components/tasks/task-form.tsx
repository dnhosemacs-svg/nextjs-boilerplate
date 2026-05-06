"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Select, SelectItem, TextArea, TextInput } from "@carbon/react";

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
    <form
      className="flex flex-col gap-8 md:gap-10 carbon-shell"
      onSubmit={onSubmit}
    >
      <h2 className="text-lg font-medium leading-snug">{heading}</h2>

      <div className="flex flex-col gap-6 md:gap-8">
        <TextInput
          labelText="Título del pedido"
          id="title"
          name="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          className="carbon-input"
          placeholder="Ej: Mesa de comedor en roble"
        />

        <TextArea
          labelText="Descripción"
          id="description"
          name="description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="carbon-input"
          placeholder="Medidas, acabado, plazo y notas para el taller (contacto si aplica)"
        />

        <Select
          labelText="Estado"
          id="status"
          name="status"
          value={status}
          onChange={(event) => setStatus(event.target.value as TaskStatus)}
          className="carbon-input"
        >
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value} text={option.label} />
          ))}
        </Select>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        kind="primary"
        className="carbon-btn-primary self-start"
      >
        {isSubmitting
          ? "Guardando..."
          : mode === "create"
            ? "Crear pedido"
            : "Guardar cambios"}
      </Button>
    </form>
  );
}
