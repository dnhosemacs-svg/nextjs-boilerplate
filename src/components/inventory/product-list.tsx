"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteProductMutation,
  useProductsQuery,
} from "@/hooks/inventory";
import type { Product } from "@/types/inventory";
import { ConfirmDialog } from "./confirm-dialog";
import { ProductCard } from "./product-card";
import { ProductForm } from "./product-form";

function ProductListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-36 w-full rounded-xl" aria-hidden />
      ))}
    </div>
  );
}

export function ProductList() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useProductsQuery();
  const deleteMutation = useDeleteProductMutation();
  const [editing, setEditing] = useState<Product | null>(null);
  const [toDelete, setToDelete] = useState<Product | null>(null);

  if (isLoading) return <ProductListSkeleton />;

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Error al cargar productos"}
        </p>
        <Button className="mt-3" variant="outline" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  const products = data ?? [];

  if (products.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay productos con estos filtros.
      </p>
    );
  }

  return (
    <>
      {isFetching && !isLoading ? (
        <p className="mb-2 text-xs text-muted-foreground">Actualizando…</p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) =>
          editing?.id === p.id ? (
            <div key={p.id} className="inventory-warm-edit-card">
              <h3 className="inventory-warm-edit-title">Editar producto</h3>
              <ProductForm
                mode="edit"
                product={p}
                onDone={() => setEditing(null)}
              />
            </div>
          ) : (
            <ProductCard
              key={p.id}
              product={p}
              onEdit={() => setEditing(p)}
              onDelete={() => setToDelete(p)}
            />
          ),
        )}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Eliminar producto"
        description={`¿Seguro que quieres eliminar «${toDelete?.name}»? Esta acción no se puede deshacer.`}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (!toDelete) return;
          deleteMutation.mutate(toDelete.id, {
            onSuccess: () => {
              setToDelete(null);
              if (editing?.id === toDelete.id) setEditing(null);
            },
          });
        }}
      />

      {deleteMutation.isError && toDelete ? (
        <p className="mt-2 text-sm text-destructive">
          {deleteMutation.error.message}
        </p>
      ) : null}
    </>
  );
}
