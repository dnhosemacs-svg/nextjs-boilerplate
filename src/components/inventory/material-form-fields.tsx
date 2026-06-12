"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
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
import type { MaterialFormValues } from "./material-form";

const UNIT_OPTIONS = [
  { value: "UD", label: "Unidad (UD)" },
  { value: "M", label: "Metro (M)" },
  { value: "M2", label: "Metro cuadrado (M2)" },
  { value: "L", label: "Litro (L)" },
  { value: "KG", label: "Kilogramo (KG)" },
] as const;

type MaterialFormFieldsProps = {
  form: UseFormReturn<MaterialFormValues>;
  categories: { id: string; name: string }[];
  fieldId: (name: string) => string;
  pending: boolean;
  apiError: Error | null;
  submitLabel: string;
  onSubmit: (values: MaterialFormValues) => void;
};

export function MaterialFormFields({
  form,
  categories,
  fieldId,
  pending,
  apiError,
  submitLabel,
  onSubmit,
}: MaterialFormFieldsProps) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="inventory-form">
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
