"use client";

import { useEffect } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  createProductSchema,
  type UpdateProductInput,
} from "@/lib/validators/product";
import {
  useCategoriesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/hooks/inventory";
import type { Product } from "@/types/inventory";

const editProductFormSchema = createProductSchema.omit({ stock: true });

type CreateProductFormValues = z.infer<typeof createProductSchema>;
type EditProductFormValues = z.infer<typeof editProductFormSchema>;

type ProductFormProps = {
  mode?: "create" | "edit";
  product?: Product;
  onDone?: () => void;
};

export function ProductForm({
  mode = "create",
  product,
  onDone,
}: ProductFormProps) {
  const { data: categories = [] } = useCategoriesQuery();
  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const isEdit = mode === "edit";
  const fieldId = (name: string) =>
    isEdit && product ? `product-${name}-${product.id}` : `product-${name}`;

  const form = useForm<CreateProductFormValues | EditProductFormValues>({
    resolver: zodResolver(
      isEdit ? editProductFormSchema : createProductSchema,
    ) as Resolver<CreateProductFormValues | EditProductFormValues>,
    defaultValues: isEdit
      ? {
          name: product?.name ?? "",
          description: product?.description ?? "",
          sku: product?.sku ?? "",
          price: Number(product?.price ?? 0),
          categoryId: product?.categoryId ?? "",
        }
      : {
          name: "",
          description: "",
          sku: "",
          price: 0,
          stock: 0,
          categoryId: "",
        },
  });

  useEffect(() => {
    if (!isEdit || !product) return;
    form.reset({
      name: product.name,
      description: product.description ?? "",
      sku: product.sku ?? "",
      price: Number(product.price),
      categoryId: product.categoryId,
    });
  }, [product, isEdit, form]);

  function onSubmit(values: CreateProductFormValues | EditProductFormValues) {
    if (isEdit) {
      if (!product) return;

      const editValues = editProductFormSchema.parse(values);

      const input: UpdateProductInput = {
        name: editValues.name,
        description: editValues.description?.trim() || null,
        sku: editValues.sku?.trim() || null,
        price: editValues.price,
        categoryId: editValues.categoryId,
      };

      updateMutation.mutate(
        { id: product.id, input },
        { onSuccess: () => onDone?.() },
      );
      return;
    }

    const createValues = createProductSchema.parse(values);
    createMutation.mutate(
      {
        ...createValues,
        description: createValues.description?.trim() || undefined,
        sku: createValues.sku?.trim() || undefined,
      },
      {
        onSuccess: () => form.reset(),
      },
    );
  }

  const pending = createMutation.isPending || updateMutation.isPending;
  const apiError = createMutation.error ?? updateMutation.error;

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

        {!isEdit ? (
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
                    value={field.value}
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
        {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear producto"}
      </Button>
    </form>
  );
}
