import { z } from "zod";

import type { TaskStatus } from "@/types/task";
import { nonEmptyUpdateSchema } from "@/lib/validators/common";

const taskStatusSchema = z.enum(["pending", "in_progress", "done"] satisfies [
  TaskStatus,
  ...TaskStatus[],
]);

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "El título es obligatorio")
    .max(120, "El título es demasiado largo"),
  description: z
    .string()
    .trim()
    .min(1, "La descripción no puede estar vacía")
    .max(2000, "La descripción es demasiado larga")
    .optional(),
  status: taskStatusSchema.optional().default("pending"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = nonEmptyUpdateSchema({
  title: z
    .string()
    .trim()
    .min(1, "El título no puede estar vacío")
    .max(120, "El título es demasiado largo")
    .optional(),
  description: z
    .string()
    .trim()
    .min(1, "La descripción no puede estar vacía")
    .max(2000, "La descripción es demasiado larga")
    .optional(),
  status: taskStatusSchema.optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

