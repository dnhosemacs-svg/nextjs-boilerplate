"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTask } from "@/lib/api";

type QuickCompleteButtonProps = {
  taskId: string;
  isDone: boolean;
};

export default function QuickCompleteButton({ taskId, isDone }: QuickCompleteButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onComplete() {
    if (isDone || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateTask(taskId, { status: "done" });
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isDone) {
    return <span className="quick-complete-done">Ya completado</span>;
  }

  return (
    <button type="button" onClick={onComplete} disabled={isSubmitting} className="ui-link-button">
      {isSubmitting ? "Completando..." : "Completar pedido"}
    </button>
  );
}
