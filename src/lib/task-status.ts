import type { TaskStatus } from "@/types/task";

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  pending: "Pendiente",
  in_progress: "En progreso",
  done: "Completada",
};

export const TASK_STATUS_OPTIONS = (
  Object.entries(TASK_STATUS_LABEL) as [TaskStatus, string][]
).map(([value, label]) => ({ value, label }));

export function formatTaskStatus(status: TaskStatus) {
  return TASK_STATUS_LABEL[status];
}
