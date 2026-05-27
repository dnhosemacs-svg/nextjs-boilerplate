import { z } from "zod";

import { canTransitionOrder, findOrderTransition } from "@/lib/order-transitions";
import { nonEmptyUpdateSchema } from "@/lib/validators/common";
import { ORDER_STATUSES } from "@/types/order-status";
import type { OrderStatus } from "@/types/order-status";
import type { UserRole } from "@/types/user-role";

const orderStatusSchema = z.enum(
  ORDER_STATUSES as unknown as [OrderStatus, ...OrderStatus[]],
);

/** Tipos de mueble v1 (ampliar en tarjeta 3.3) */
export const furnitureTypeSchema = z.enum([
  "ESTANTERIA",
  "MESA",
  "ARMARIO",
  "MESITA",
  "CAJONERA",
  "PUERTA",
  "ENCIMERA",
  "ZAPATERO",
]);

export type FurnitureType = z.infer<typeof furnitureTypeSchema>;

/** Parámetros libres por mueble (validación fina en BOM) */
export const orderParametersSchema = z.record(z.string(), z.unknown());

/** POST /api/orders — siempre empieza en DRAFT */
export const createOrderSchema = z.object({
  clientId: z.string().trim().min(1, "El cliente es obligatorio"),
  furnitureType: furnitureTypeSchema,
  parameters: orderParametersSchema,
  notes: z
    .string()
    .trim()
    .max(4000, "Las notas son demasiado largas")
    .optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

/** Solo editable en DRAFT (y opcionalmente PENDING si taller corrige) */
export const updateOrderDraftSchema = nonEmptyUpdateSchema({
  furnitureType: furnitureTypeSchema.optional(),
  parameters: orderParametersSchema.optional(),
  notes: z
    .union([
      z.string().trim().max(4000, "Las notas son demasiado largas"),
      z.null(),
    ])
    .optional(),
});

export type UpdateOrderDraftInput = z.infer<typeof updateOrderDraftSchema>;

/** Línea de material planificada */
export const orderMaterialLineSchema = z.object({
  materialId: z.string().trim().min(1),
  plannedQty: z.coerce
    .number()
    .positive("La cantidad planificada debe ser mayor que cero")
    .finite(),
});

export const orderMaterialLinesSchema = z
  .array(orderMaterialLineSchema)
  .min(1, "Añade al menos una línea de material");

/** PATCH transición de estado */
export const transitionOrderSchema = z.object({
  status: orderStatusSchema,
});

export type TransitionOrderInput = z.infer<typeof transitionOrderSchema>;

/**
 * Valida cuerpo de transición + rol. Usar tras leer `order.status` de BD.
 */
export function parseOrderTransition(
  currentStatus: OrderStatus,
  body: unknown,
  role: UserRole,
) {
  const parsed = transitionOrderSchema.safeParse(body);
  if (!parsed.success) return parsed;

  const next = parsed.data.status;
  if (next === currentStatus) {
    return {
      success: false as const,
      error: z.ZodError.create([
        {
          code: "custom",
          message: "El pedido ya está en ese estado",
          path: ["status"],
        },
      ]),
    };
  }

  if (!canTransitionOrder(currentStatus, next, role)) {
    return {
      success: false as const,
      error: z.ZodError.create([
        {
          code: "custom",
          message: "Transición no permitida para tu rol",
          path: ["status"],
        },
      ]),
    };
  }

  const rule = findOrderTransition(currentStatus, next)!;
  return { success: true as const, data: { from: rule.from, to: rule.to } };
}

/** Mano de obra al cierre (READY / entrega) */
export const setLaborAmountSchema = z.object({
  laborAmount: z.coerce
    .number()
    .nonnegative("La mano de obra no puede ser negativa")
    .finite(),
});

export type SetLaborAmountInput = z.infer<typeof setLaborAmountSchema>;

/** Campos editables por estado (referencia para handlers) */
export const ORDER_EDITABLE_FIELDS_BY_STATUS: Record<
  OrderStatus,
  readonly ("furnitureType" | "parameters" | "notes" | "laborAmount" | "lines")[]
> = {
  DRAFT: ["furnitureType", "parameters", "notes", "lines"],
  PENDING: ["notes", "lines"],
  APPROVED: ["lines"],
  IN_PRODUCTION: ["lines"],
  READY: ["laborAmount"],
  DELIVERED: [],
  CANCELLED: [],
};
