import { z } from "zod";

import { UserRole } from "@/types/user-role";

/** Roles que un ADMIN puede asignar al crear o editar usuarios (no incluye ADMIN). */
export const ADMIN_CREATABLE_ROLES = [UserRole.WORKER, UserRole.CLIENT] as const;

const adminCreatableRoleSchema = z.enum(ADMIN_CREATABLE_ROLES);

export const createUserByAdminSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: "Correo electrónico no válido" })),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(128, "La contraseña es demasiado larga"),
  name: z
    .string()
    .trim()
    .min(1, "El nombre no puede estar vacío")
    .max(120, "El nombre es demasiado largo")
    .optional(),
  role: adminCreatableRoleSchema,
});

export type CreateUserByAdminInput = z.infer<typeof createUserByAdminSchema>;

export const updateUserByAdminSchema = z
  .object({
    role: adminCreatableRoleSchema.optional(),
    name: z.string().trim().max(120, "El nombre es demasiado largo").optional(),
  })
  .refine((data) => data.role !== undefined || data.name !== undefined, {
    message: "Indica al menos un campo para actualizar",
  });

export type UpdateUserByAdminInput = z.infer<typeof updateUserByAdminSchema>;
