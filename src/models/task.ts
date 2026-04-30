import { model, models, Schema, type InferSchemaType } from "mongoose";
import type { Task, TaskStatus } from "@/types/task";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "done"] satisfies TaskStatus[],
      required: true,
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

type TaskDocument = InferSchemaType<typeof taskSchema> & {
  _id: { toString(): string };
  createdAt: Date;
  updatedAt: Date;
};

export function mapTaskDocumentToTask(task: TaskDocument): Task {
  return {
    id: task._id.toString(),
    title: task.title,
    description: task.description ?? undefined,
    status: task.status as TaskStatus,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export const TaskModel = models.Task || model("Task", taskSchema);
