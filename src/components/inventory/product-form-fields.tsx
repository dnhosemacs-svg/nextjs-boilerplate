"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export type ProductFormFieldValues = {
  name: string;
  description?: string;
  sku?: string;
  price: number;
  categoryId: string;
  stock?: number;
};

type ProductFormFieldsProps = {
  form: UseFormReturn<ProductFormFieldValues>;
  categories: { id: string; name: string }[];
  fieldId: (name: string) => string;
  pending: boolean;
  apiError: Error | null;
  submitLabel: string;
  showStock?: boolean;
  onSubmit: (values: ProductFormFieldValues) => void;
};

export function ProductFormFields({
  form,
  categories,
  fieldId,
  pending,
  apiError,
  submitLabel,
  showStock = false,
  onSubmit,
}: ProductFormFieldsProps) {
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="inventory-form"
    >
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
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor={fieldId("description")}>Descripción</FieldLabel>
              <FieldContent>
                <Textarea
                  id={fieldId("description")}
                  rows={3}
                  {...field}
                  value={field.value ?? ""}
                />
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
                <Input
                  id={fieldId("sku")}
                  {...field}
                  value={field.value ?? ""}
                />
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
              <FieldLabel>Categoría</FieldLabel>
              <FieldContent>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Elige categoría" />
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
          name="price"
          control={form.control}
          render={({ field, fieldState }) => {
            const priceNum =
              typeof field.value === "number"
                ? field.value
                : Number(field.value) || 0;

            return (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor={fieldId("price")}>Precio (€)</FieldLabel>
                <FieldContent>
                  <Input
                    id={fieldId("price")}
                    type="number"
                    step="0.01"
                    min="0"
                    value={priceNum === 0 ? "" : priceNum}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : Number(e.target.value),
                      )
                    }
                  />
                  <FieldError errors={[fieldState.error]} />
                </FieldContent>
              </Field>
            );
          }}
        />

        {showStock ? (
          <Controller
            name="stock"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor={fieldId("stock")}>Stock inicial</FieldLabel>
                <FieldContent>
                  <Input
                    id={fieldId("stock")}
                    type="number"
                    min={0}
                    value={field.value ?? 0}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  <FieldError errors={[fieldState.error]} />
                </FieldContent>
              </Field>
            )}
          />
        ) : null}
      </FieldGroup>

      {apiError ? (
        <p className="text-sm text-destructive">{apiError.message}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Guardando…" : submitLabel}
      </Button>
    </form>
  );
}
