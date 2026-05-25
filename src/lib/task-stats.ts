import type { Task } from "@/types/task";

export type TaskStats = {
  total: number;
  pending: number;
  inProgress: number;
  done: number;
  completionRate: number;
};

export function getTaskStats(tasks: Task[]): TaskStats {
  const total = tasks.length;
  const pending = tasks.filter((task) => task.status === "pending").length;
  const inProgress = tasks.filter((task) => task.status === "in_progress").length;
  const done = tasks.filter((task) => task.status === "done").length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  return { total, pending, inProgress, done, completionRate };
}
