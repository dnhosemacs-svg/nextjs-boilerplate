"use client";

import { useEffect } from "react";
import { useForm, Controller, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
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

type MaterialFormValues = z.infer<typeof materialFormSchema>;

type MaterialFormProps = {
  mode?: "create" | "edit";
  material?: Material;
  onDone?: () => void;
};

const UNIT_OPTIONS = [
  { value: "UD", label: "Unidad (UD)" },
  { value: "M", label: "Metro (M)" },
  { value: "M2", label: "Metro cuadrado (M2)" },
  { value: "L", label: "Litro (L)" },
  { value: "KG", label: "Kilogramo (KG)" },
] as const;

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
  }, [material, form]);

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

type MaterialFormFieldsProps = {
  form: UseFormReturn<MaterialFormValues>;
  categories: { id: string; name: string }[];
  fieldId: (name: string) => string;
  pending: boolean;
  apiError: Error | null;
  submitLabel: string;
  onSubmit: (values: MaterialFormValues) => void;
};

function MaterialFormFields({
  form,
  categories,
  fieldId,
  pending,
  apiError,
  submitLabel,
  onSubmit,
}: MaterialFormFieldsProps) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor={fieldId("name")}>Nombre</FieldLabel>
              <FieldContent>
                <Input id={fieldId("name")} {...field} />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="sku"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor={fieldId("sku")}>SKU</FieldLabel>
              <FieldContent>
                <Input id={fieldId("sku")} {...field} value={field.value ?? ""} />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="categoryId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel>Categoria</FieldLabel>
              <FieldContent>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Elige categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="unit"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel>Unidad</FieldLabel>
              <FieldContent>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Elige unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_OPTIONS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="unitCost"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor={fieldId("unitCost")}>Coste unitario (EUR)</FieldLabel>
              <FieldContent>
                <Input
                  id={fieldId("unitCost")}
                  type="number"
                  step="0.01"
                  min="0"
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="minStock"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor={fieldId("minStock")}>Stock minimo</FieldLabel>
              <FieldContent>
                <Input
                  id={fieldId("minStock")}
                  type="number"
                  step="0.001"
                  min="0"
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="location"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor={fieldId("location")}>Ubicacion</FieldLabel>
              <FieldContent>
                <Input
                  id={fieldId("location")}
                  placeholder="Pasillo, estanteria o zona"
                  {...field}
                  value={field.value ?? ""}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />
      </FieldGroup>

      {apiError ? <p className="text-sm text-destructive">{apiError.message}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
