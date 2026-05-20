import { z } from "zod";

/** Campos permitidos en `orderBy` del listado de productos (GET). */
export const productSortBySchema = z.enum([
  "name",
  "price",
  "stock",
  "createdAt",
  "updatedAt",
]);

export type ProductSortBy = z.infer<typeof productSortBySchema>;

/**
 * Query params del GET /api/products.
 * Convén construir el objeto desde URLSearchParams y pasar `undefined` si falta la clave.
 */
export const productListQuerySchema = z.object({
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
  sortBy: productSortBySchema.optional().default("name"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(200, "El nombre es demasiado largo"),
  description: z
    .string()
    .trim()
    .max(5000, "La descripción es demasiado larga")
    .optional(),
  sku: z
    .string()
    .trim()
    .max(80, "El SKU es demasiado largo")
    .optional(),
  price: z.coerce.number().positive("El precio debe ser mayor que cero").finite(),
  stock: z.number().int().min(0, "El stock no puede ser negativo").optional().default(0),
  categoryId: z.string().trim().min(1, "La categoría es obligatoria"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

/** PATCH /api/products/[id] — el stock se actualiza solo en /api/products/[id]/stock */
export const updateProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "El nombre no puede estar vacío")
      .max(200, "El nombre es demasiado largo")
      .optional(),
    description: z
      .union([
        z.string().trim().max(5000, "La descripción es demasiado larga"),
        z.null(),
      ])
      .optional(),
    sku: z
      .union([
        z
          .string()
          .trim()
          .min(1, "El SKU no puede estar vacío")
          .max(80, "El SKU es demasiado largo"),
        z.null(),
      ])
      .optional(),
    price: z.coerce.number().positive("El precio debe ser mayor que cero").finite().optional(),
    categoryId: z.string().trim().min(1, "La categoría no puede estar vacía").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  });

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const updateProductStockSchema = z.object({
  stock: z.number().int().min(0, "El stock no puede ser negativo"),
});

export type UpdateProductStockInput = z.infer<typeof updateProductStockSchema>;
