"use client";

import { useEffect } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  ProductFormFields,
  type ProductFormFieldValues,
} from "./product-form-fields";

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
  return <ProductFormCreate />;
}

function ProductFormCreate() {
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
    <ProductFormFields
      form={form as UseFormReturn<ProductFormFieldValues>}
      categories={categories}
      fieldId={fieldId}
      pending={createMutation.isPending}
      apiError={createMutation.error}
      submitLabel="Crear producto"
      showStock
      onSubmit={(values) => onSubmit(values as CreateProductFormValues)}
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
    // Solo resetear al cambiar de producto en edición
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

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
    <ProductFormFields
      form={form as UseFormReturn<ProductFormFieldValues>}
      categories={categories}
      fieldId={fieldId}
      pending={updateMutation.isPending}
      apiError={updateMutation.error}
      submitLabel="Guardar cambios"
      onSubmit={(values) => onSubmit(values as EditProductFormValues)}
    />
  );
}
