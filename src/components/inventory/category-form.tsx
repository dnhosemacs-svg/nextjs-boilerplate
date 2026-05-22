"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCategorySchema,
  type CreateCategoryInput,
} from "@/lib/validators/category";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "@/hooks/inventory";
import type { Category } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

type CategoryFormProps = {
  mode: "create" | "edit";
  category?: Category;
  onDone?: () => void;
};

export function CategoryForm({ mode, category, onDone }: CategoryFormProps) {
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();

  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { name: category?.name ?? "" },
  });

  useEffect(() => {
    if (category) {
      form.reset({ name: category.name });
    }
  }, [category, form]);

  function onSubmit(values: CreateCategoryInput) {
    if (mode === "create") {
      createMutation.mutate(values, {
        onSuccess: () => {
          form.reset({ name: "" });
          onDone?.();
        },
      });
      return;
    }

    if (!category) return;

    updateMutation.mutate(
      { id: category.id, input: { name: values.name } },
      { onSuccess: () => onDone?.() },
    );
  }

  const pending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error ?? updateMutation.error;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={mode === "edit" ? "flex flex-1 gap-2" : "flex gap-2"}
    >
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={!!fieldState.error} className="flex-1">
            <FieldLabel className="sr-only">Nombre</FieldLabel>
            <FieldContent>
              <Input placeholder="Nombre de categoría" {...field} />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />
      <Button type="submit" disabled={pending}>
        {mode === "create" ? "Crear" : "Guardar"}
      </Button>
      {error ? (
        <p className="w-full text-sm text-destructive">{error.message}</p>
      ) : null}
    </form>
  );
}
