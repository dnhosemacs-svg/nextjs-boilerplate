"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { deleteTask } from "@/lib/api";

type DeleteTaskButtonProps = {
  taskId: string;
};

export default function DeleteTaskButton({ taskId }: DeleteTaskButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (!window.confirm("Estas seguro de que quieres eliminar este pedido?")) {
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
    <div className="space-y-2">
      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleting}
        className="inline-flex h-10 items-center justify-center rounded-full border border-red-500/50 px-4 text-sm font-medium text-red-700 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-300"
      >
        {isDeleting ? "Eliminando..." : "Eliminar pedido"}
      </button>
      {error ? <p className="text-sm text-red-600 dark:text-red-300">{error}</p> : null}
    </div>
  );
}
