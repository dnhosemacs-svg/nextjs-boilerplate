"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  createMaterialSchema,
  type UpdateMaterialInput,
} from "@/lib/validators/material";
import {
  useCategoriesQuery,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
} from "@/hooks/inventory";
import type { Material } from "@/types/inventory";
import { MaterialFormFields } from "./material-form-fields";

const materialFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(200, "El nombre es demasiado largo"),
  sku: z.string().trim().max(80, "El SKU es demasiado largo").optional(),
  unit: z.enum(["M", "M2", "UD", "L", "KG"]),
  unitCost: z.number().positive("El coste unitario debe ser mayor que cero").finite(),
  minStock: z.number().min(0, "El stock minimo no puede ser negativo").finite(),
  location: z.string().trim().max(120, "La ubicacion es demasiado larga").optional(),
  categoryId: z.string().trim().min(1, "La categoria es obligatoria"),
});

export type MaterialFormValues = z.infer<typeof materialFormSchema>;

type MaterialFormProps = {
  mode?: "create" | "edit";
  material?: Material;
  onDone?: () => void;
};

export function MaterialForm({ mode = "create", material, onDone }: MaterialFormProps) {
  if (mode === "edit") {
    return <MaterialFormEdit material={material} onDone={onDone} />;
  }
  return <MaterialFormCreate onDone={onDone} />;
}

function MaterialFormCreate({ onDone }: { onDone?: () => void }) {
  const { data: categories = [] } = useCategoriesQuery();
  const createMutation = useCreateMaterialMutation();
  const fieldId = (name: string) => `material-${name}`;

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: {
      name: "",
      sku: "",
      unit: "UD",
      unitCost: 0,
      minStock: 0,
      location: "",
      categoryId: "",
    },
  });

  function onSubmit(values: MaterialFormValues) {
    const payload = createMaterialSchema.parse(values);
    createMutation.mutate(
      {
        ...payload,
        sku: payload.sku?.trim() || undefined,
        location: payload.location?.trim() || undefined,
      },
      {
        onSuccess: () => {
          form.reset();
          onDone?.();
        },
      },
    );
  }

  return (
    <MaterialFormFields
      form={form}
      categories={categories}
      fieldId={fieldId}
      pending={createMutation.isPending}
      apiError={createMutation.error}
      submitLabel="Crear material"
      onSubmit={onSubmit}
    />
  );
}

function MaterialFormEdit({
  material,
  onDone,
}: {
  material?: Material;
  onDone?: () => void;
}) {
  const { data: categories = [] } = useCategoriesQuery();
  const updateMutation = useUpdateMaterialMutation();
  const fieldId = (name: string) =>
    material ? `material-${name}-${material.id}` : `material-${name}`;

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: {
      name: material?.name ?? "",
      sku: material?.sku ?? "",
      unit: material?.unit ?? "UD",
      unitCost: Number(material?.unitCost ?? 0),
      minStock: Number(material?.minStock ?? 0),
      location: material?.location ?? "",
      categoryId: material?.categoryId ?? "",
    },
  });

  useEffect(() => {
    if (!material) return;
    form.reset({
      name: material.name,
      sku: material.sku ?? "",
      unit: material.unit,
      unitCost: Number(material.unitCost),
      minStock: Number(material.minStock),
      location: material.location ?? "",
      categoryId: material.categoryId,
    });
    // Solo resetear al cambiar de material en edición
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material?.id]);

  function onSubmit(values: MaterialFormValues) {
    if (!material) return;

    const input: UpdateMaterialInput = {
      name: values.name,
      sku: values.sku?.trim() || null,
      unit: values.unit,
      unitCost: values.unitCost,
      minStock: values.minStock,
      location: values.location?.trim() || null,
      categoryId: values.categoryId,
    };

    updateMutation.mutate(
      { id: material.id, input },
      { onSuccess: () => onDone?.() },
    );
  }

  return (
    <MaterialFormFields
      form={form}
      categories={categories}
      fieldId={fieldId}
      pending={updateMutation.isPending}
      apiError={updateMutation.error}
      submitLabel="Guardar cambios"
      onSubmit={onSubmit}
    />
  );
}
