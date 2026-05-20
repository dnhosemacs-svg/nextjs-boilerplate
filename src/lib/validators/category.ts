import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(120, "El nombre es demasiado largo"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "El nombre no puede estar vacío")
      .max(120, "El nombre es demasiado largo")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  });

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
