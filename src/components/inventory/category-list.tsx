"use client";

import { useState } from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useCategoriesQuery,
  useDeleteCategoryMutation,
} from "@/hooks/inventory";
import type { Category } from "@/types/inventory";
import { CategoryForm } from "./category-form";
import { ConfirmDialog } from "./confirm-dialog";

export function CategoryList() {
  const { data = [], isLoading, isError, error, refetch } = useCategoriesQuery();
  const deleteMutation = useDeleteCategoryMutation();
  const [editing, setEditing] = useState<Category | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando…</p>;
  }

  if (isError) {
    return (
      <div>
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Error al cargar categorías"}
        </p>
        <Button variant="outline" className="mt-2" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay categorías. Crea la primera arriba.
      </p>
    );
  }

  return (
    <>
      <ul className="inventory-warm-list">
        {data.map((cat) => (
          <li
            key={cat.id}
            className="inventory-warm-list-item"
          >
            {editing?.id === cat.id ? (
              <div className="inventory-warm-list-edit w-full min-w-0">
                <CategoryForm
                  mode="edit"
                  category={cat}
                  onDone={() => setEditing(null)}
                />
              </div>
            ) : (
              <>
                <span className="inventory-warm-list-label">{cat.name}</span>
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setEditing(cat)}
                    aria-label={`Editar ${cat.name}`}
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setToDelete(cat)}
                    aria-label={`Eliminar ${cat.name}`}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Eliminar categoría"
        description={`¿Seguro que quieres eliminar «${toDelete?.name}»? No debe tener productos asociados.`}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (!toDelete) return;
          deleteMutation.mutate(toDelete.id, {
            onSuccess: () => setToDelete(null),
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
