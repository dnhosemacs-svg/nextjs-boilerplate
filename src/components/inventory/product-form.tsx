"use client";

import { useEffect } from "react";
import { useForm, Controller, type UseFormReturn } from "react-hook-form";
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

/** Formularios cliente: price como number (evita unknown con z.coerce en build). */
const createProductFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(200, "El nombre es demasiado largo"),
  description: z
    .string()
    .trim()
    .max(5000, "La descripción es demasiado larga")
    .optional(),
  sku: z.string().trim().max(80, "El SKU es demasiado largo").optional(),
  price: z.number().positive("El precio debe ser mayor que cero").finite(),
  stock: z.number().int().min(0, "El stock no puede ser negativo"),
  categoryId: z.string().trim().min(1, "La categoría es obligatoria"),
});

const editProductFormSchema = createProductFormSchema.omit({ stock: true });

type CreateProductFormValues = z.infer<typeof createProductFormSchema>;
type EditProductFormValues = z.infer<typeof editProductFormSchema>;

type ProductFormProps = {
  mode?: "create" | "edit";
  product?: Product;
  onDone?: () => void;
};

export function ProductForm({ mode = "create", product, onDone }: ProductFormProps) {
  if (mode === "edit") {
    return <ProductFormEdit product={product} onDone={onDone} />;
  }
  return <ProductFormCreate onDone={onDone} />;
}

function ProductFormCreate({ onDone }: { onDone?: () => void }) {
  const { data: categories = [] } = useCategoriesQuery();
  const createMutation = useCreateProductMutation();
  const fieldId = (name: string) => `product-${name}`;

  const form = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductFormSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      price: 0,
      stock: 0,
      categoryId: "",
    },
  });

  function onSubmit(values: CreateProductFormValues) {
    const payload = createProductSchema.parse(values);
    createMutation.mutate(
      {
        ...payload,
        description: payload.description?.trim() || undefined,
        sku: payload.sku?.trim() || undefined,
      },
      { onSuccess: () => form.reset() },
    );
  }

  return (
    <ProductFormFieldsCreate
      form={form}
      categories={categories}
      fieldId={fieldId}
      pending={createMutation.isPending}
      apiError={createMutation.error}
      submitLabel="Crear producto"
      onSubmit={onSubmit}
    />
  );
}

function ProductFormEdit({
  product,
  onDone,
}: {
  product?: Product;
  onDone?: () => void;
}) {
  const { data: categories = [] } = useCategoriesQuery();
  const updateMutation = useUpdateProductMutation();
  const fieldId = (name: string) =>
    product ? `product-${name}-${product.id}` : `product-${name}`;

  const form = useForm<EditProductFormValues>({
    resolver: zodResolver(editProductFormSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      sku: product?.sku ?? "",
      price: Number(product?.price ?? 0),
      categoryId: product?.categoryId ?? "",
    },
  });

  useEffect(() => {
    if (!product) return;
    form.reset({
      name: product.name,
      description: product.description ?? "",
      sku: product.sku ?? "",
      price: Number(product.price),
      categoryId: product.categoryId,
    });
  }, [product, form]);

  function onSubmit(values: EditProductFormValues) {
    if (!product) return;

    const input: UpdateProductInput = {
      name: values.name,
      description: values.description?.trim() || null,
      sku: values.sku?.trim() || null,
      price: values.price,
      categoryId: values.categoryId,
    };

    updateMutation.mutate(
      { id: product.id, input },
      { onSuccess: () => onDone?.() },
    );
  }

  return (
    <ProductFormFieldsEdit
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

type ProductFormFieldsCreateProps = {
  form: UseFormReturn<CreateProductFormValues>;
  categories: { id: string; name: string }[];
  fieldId: (name: string) => string;
  pending: boolean;
  apiError: Error | null;
  submitLabel: string;
  onSubmit: (values: CreateProductFormValues) => void;
};

function ProductFormFieldsCreate({
  form,
  categories,
  fieldId,
  pending,
  apiError,
  submitLabel,
  onSubmit,
}: ProductFormFieldsCreateProps) {
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
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

type ProductFormFieldsEditProps = {
  form: UseFormReturn<EditProductFormValues>;
  categories: { id: string; name: string }[];
  fieldId: (name: string) => string;
  pending: boolean;
  apiError: Error | null;
  submitLabel: string;
  onSubmit: (values: EditProductFormValues) => void;
};

function ProductFormFieldsEdit({
  form,
  categories,
  fieldId,
  pending,
  apiError,
  submitLabel,
  onSubmit,
}: ProductFormFieldsEditProps) {
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
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
