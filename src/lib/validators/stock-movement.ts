import { z } from "zod";

const positiveQty = z.coerce
  .number()
  .positive("La cantidad debe ser mayor que cero")
  .finite();

const signedQty = z.coerce
  .number()
  .refine((n) => n !== 0, "El ajuste no puede ser cero")
  .finite();

export const recordStockInSchema = z.object({
  quantity: positiveQty,
  reason: z.string().trim().max(500).optional(),
});

export const recordStockOutSchema = z.object({
  quantity: positiveQty,
  orderId: z.string().trim().min(1, "orderId es obligatorio para salidas"),
  reason: z.string().trim().max(500).optional(),
});

export const recordStockAdjustSchema = z.object({
  quantity: signedQty,
  reason: z
    .string()
    .trim()
    .min(1, "El motivo es obligatorio en ajustes")
    .max(500),
});
