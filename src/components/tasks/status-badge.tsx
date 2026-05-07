import { formatTaskStatus } from "@/lib/task-status";
import type { TaskStatus } from "@/types/task";

type StatusBadgeProps = {
  status: TaskStatus;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {formatTaskStatus(status)}
    </span>
  );
}
