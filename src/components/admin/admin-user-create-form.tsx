"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { useCreateUserMutation } from "@/hooks/users";
import { roleLabel } from "@/lib/role-labels";
import {
  ADMIN_CREATABLE_ROLES,
  createUserByAdminSchema,
  type CreateUserByAdminInput,
} from "@/lib/validators/user";
import { UserRole } from "@/types/user-role";

export function AdminUserCreateForm() {
  const createMutation = useCreateUserMutation();

  const form = useForm<CreateUserByAdminInput>({
    resolver: zodResolver(createUserByAdminSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      role: UserRole.WORKER,
    },
  });

  function onSubmit(values: CreateUserByAdminInput) {
    createMutation.mutate(
      {
        ...values,
        name: values.name?.trim() ? values.name.trim() : undefined,
      },
      {
        onSuccess: () => {
          form.reset({
            email: "",
            password: "",
            name: "",
            role: UserRole.WORKER,
          });
        },
      },
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={!!fieldState.error}>
            <FieldLabel>Correo</FieldLabel>
            <FieldContent>
              <Input type="email" autoComplete="off" {...field} />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        name="password"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={!!fieldState.error}>
            <FieldLabel>Contraseña</FieldLabel>
            <FieldContent>
              <Input type="password" autoComplete="new-password" {...field} />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={!!fieldState.error}>
            <FieldLabel>Nombre (opcional)</FieldLabel>
            <FieldContent>
              <Input {...field} />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        name="role"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={!!fieldState.error}>
            <FieldLabel>Rol</FieldLabel>
            <FieldContent>
              <select
                {...field}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                {ADMIN_CREATABLE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {roleLabel(role)}
                  </option>
                ))}
              </select>
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      <div className="flex items-end">
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Creando…" : "Crear usuario"}
        </Button>
      </div>

      {createMutation.isError ? (
        <p className="text-sm text-destructive sm:col-span-2 lg:col-span-5">
          {createMutation.error.message}
        </p>
      ) : null}
    </form>
  );
}
