"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@carbon/react";

import { deleteTask } from "@/lib/api";

type DeleteTaskButtonProps = {
  taskId: string;
};

export default function DeleteTaskButton({ taskId }: DeleteTaskButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este pedido?")) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      await deleteTask(taskId);
      router.push("/");
      router.refresh();
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "Error inesperado";
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="carbon-shell flex flex-col gap-2 self-start">
      <Button
        type="button"
        onClick={onDelete}
        disabled={isDeleting}
        kind="danger--tertiary"
        className="carbon-btn-danger"
      >
        {isDeleting ? "Eliminando..." : "Eliminar pedido"}
      </Button>
      {error ? <p className="text-sm text-red-600 dark:text-red-300">{error}</p> : null}
    </div>
  );
}
