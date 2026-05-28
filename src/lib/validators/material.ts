import { z } from "zod";

import { nonEmptyUpdateSchema } from "@/lib/validators/common";

export const materialUnitSchema = z.enum(["M", "M2", "UD", "L", "KG"]);

export const materialSortBySchema = z.enum([
  "name",
  "unitCost",
  "stock",
  "minStock",
  "createdAt",
  "updatedAt",
]);

export type MaterialSortBy = z.infer<typeof materialSortBySchema>;

export const materialListQuerySchema = z.object({
  search: z
    .string()
    .optional()
    .transform((s) => {
      if (s === undefined) return undefined;
      const t = s.trim();
      return t.length === 0 ? undefined : t;
    }),
  categoryId: z
    .string()
    .optional()
    .transform((s) => {
      if (s === undefined) return undefined;
      const t = s.trim();
      return t.length === 0 ? undefined : t;
    }),
  sortBy: materialSortBySchema.optional().default("name"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

export type MaterialListQuery = z.infer<typeof materialListQuerySchema>;

export const createMaterialSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(200, "El nombre es demasiado largo"),
  sku: z.string().trim().max(80, "El SKU es demasiado largo").optional(),
  unit: materialUnitSchema,
  unitCost: z.coerce.number().positive("El coste unitario debe ser mayor que cero").finite(),
  minStock: z.coerce.number().min(0, "El stock minimo no puede ser negativo").finite(),
  location: z.string().trim().max(120, "La ubicacion es demasiado larga").optional(),
  categoryId: z.string().trim().min(1, "La categoria es obligatoria"),
});

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;

export const updateMaterialSchema = nonEmptyUpdateSchema({
  name: z
    .string()
    .trim()
    .min(1, "El nombre no puede estar vacio")
    .max(200, "El nombre es demasiado largo")
    .optional(),
  sku: z
    .union([
      z
        .string()
        .trim()
        .min(1, "El SKU no puede estar vacio")
        .max(80, "El SKU es demasiado largo"),
      z.null(),
    ])
    .optional(),
  unit: materialUnitSchema.optional(),
  unitCost: z
    .coerce
    .number()
    .positive("El coste unitario debe ser mayor que cero")
    .finite()
    .optional(),
  minStock: z.coerce.number().min(0, "El stock minimo no puede ser negativo").finite().optional(),
  location: z
    .union([z.string().trim().max(120, "La ubicacion es demasiado larga"), z.null()])
    .optional(),
  categoryId: z.string().trim().min(1, "La categoria no puede estar vacia").optional(),
});

export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
