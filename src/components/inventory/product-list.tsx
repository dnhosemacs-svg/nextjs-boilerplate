"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductsQuery } from "@/hooks/inventory";
import { ProductCard } from "./product-card";

function ProductListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-36 w-full rounded-xl" aria-hidden />
      ))}
    </div>
  );
}

export function ProductList() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useProductsQuery();

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}
