import { z } from "zod";

import { nonEmptyUpdateSchema } from "@/lib/validators/common";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(120, "El nombre es demasiado largo"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = nonEmptyUpdateSchema({
  name: z
    .string()
    .trim()
    .min(1, "El nombre no puede estar vacío")
    .max(120, "El nombre es demasiado largo")
    .optional(),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
