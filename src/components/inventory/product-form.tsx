"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { z } from "zod";
import {
  createProductSchema,
  type CreateProductInput,
} from "@/lib/validators/product";

type ProductFormValues = z.input<typeof createProductSchema>;
import {
  useCategoriesQuery,
  useCreateProductMutation,
} from "@/hooks/inventory";

export function ProductForm() {
  const { data: categories = [] } = useCategoriesQuery();
  const createMutation = useCreateProductMutation();

  const form = useForm<ProductFormValues, unknown, CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      price: 0,
      stock: 0,
      categoryId: "",
    },
  });

  function onSubmit(values: CreateProductInput) {
    createMutation.mutate(
      {
        ...values,
        description: values.description?.trim() || undefined,
        sku: values.sku?.trim() || undefined,
      },
      {
        onSuccess: () => form.reset(),
      },
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor="product-name">Nombre</FieldLabel>
              <FieldContent>
                <Input id="product-name" {...field} />
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
              <FieldLabel htmlFor="product-description">Descripción</FieldLabel>
              <FieldContent>
                <Textarea
                  id="product-description"
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
              <FieldLabel htmlFor="product-sku">SKU</FieldLabel>
              <FieldContent>
                <Input id="product-sku" {...field} value={field.value ?? ""} />
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
                <FieldLabel htmlFor="product-price">Precio (€)</FieldLabel>
                <FieldContent>
                  <Input
                    id="product-price"
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

        <Controller
          name="stock"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor="product-stock">Stock inicial</FieldLabel>
              <FieldContent>
                <Input
                  id="product-stock"
                  type="number"
                  min={0}
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />
      </FieldGroup>

      {createMutation.isError ? (
        <p className="text-sm text-destructive">{createMutation.error.message}</p>
      ) : null}

      <Button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? "Guardando…" : "Crear producto"}
      </Button>
    </form>
  );
}
