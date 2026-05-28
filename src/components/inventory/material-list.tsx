"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getMaterialStock } from "@/lib/inventory-api";
import { queryKeys } from "@/lib/query-keys";
import { useMaterialsQuery } from "@/hooks/inventory";
import { useUiStore } from "@/stores/ui-store";
import { QueryErrorState } from "./query-error-state";

function MaterialListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-md" aria-hidden />
      ))}
    </div>
  );
}

function toNumber(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatDecimal(value: string) {
  const n = toNumber(value);
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(n);
}

function formatCurrency(value: string) {
  const n = toNumber(value);
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

export function MaterialList() {
  const filters = useUiStore((s) => s.productFilters);
  const materialFilters = useMemo(
    () => ({
      search: filters.search,
      categoryId: filters.categoryId,
      sortBy: "name" as const,
      sortOrder: "asc" as const,
    }),
    [filters.search, filters.categoryId],
  );

  const {
    data: materials = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useMaterialsQuery(materialFilters);

  const stockQueries = useQueries({
    queries: materials.map((material) => ({
      queryKey: [...queryKeys.materials.all, "stock", material.id] as const,
      queryFn: () => getMaterialStock(material.id),
      staleTime: 30_000,
    })),
  });

  const stockByMaterialId = useMemo(() => {
    return new Map(
      materials.map((material, index) => [material.id, stockQueries[index]?.data]),
    );
  }, [materials, stockQueries]);

  if (isLoading) return <MaterialListSkeleton />;

  if (isError) {
    return (
      <QueryErrorState
        error={error}
        fallbackMessage="Error al cargar materiales"
        onRetry={() => refetch()}
        className="rounded-xl border border-destructive/30 bg-destructive/10 p-4"
      />
    );
  }

  if (materials.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay materiales con estos filtros.</p>;
  }

  return (
    <div className="space-y-2">
      {isFetching ? <p className="text-xs text-muted-foreground">Actualizando...</p> : null}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Material</th>
              <th className="px-3 py-2 text-left font-medium">Categoria</th>
              <th className="px-3 py-2 text-left font-medium">Unidad</th>
              <th className="px-3 py-2 text-left font-medium">Coste unitario</th>
              <th className="px-3 py-2 text-left font-medium">Disponible</th>
              <th className="px-3 py-2 text-left font-medium">Reservado</th>
              <th className="px-3 py-2 text-left font-medium">Fisico</th>
              <th className="px-3 py-2 text-left font-medium">Minimo</th>
              <th className="px-3 py-2 text-left font-medium">Ubicacion</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material) => {
              const snapshot = stockByMaterialId.get(material.id);
              const available = snapshot?.available ?? "0";
              const reserved = snapshot?.reserved ?? "0";
              const physical = snapshot?.physical ?? material.stock;
              const minStock = material.minStock;
              const isLowStock = toNumber(available) < toNumber(minStock);

              return (
                <tr key={material.id} className="border-t">
                  <td className="px-3 py-2 align-middle">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{material.name}</span>
                      {isLowStock ? <Badge variant="destructive">Stock bajo</Badge> : null}
                    </div>
                    {material.sku ? (
                      <p className="text-xs text-muted-foreground">SKU: {material.sku}</p>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 align-middle">{material.category.name}</td>
                  <td className="px-3 py-2 align-middle">{material.unit}</td>
                  <td className="px-3 py-2 align-middle">{formatCurrency(material.unitCost)}</td>
                  <td className="px-3 py-2 align-middle tabular-nums">{formatDecimal(available)}</td>
                  <td className="px-3 py-2 align-middle tabular-nums">{formatDecimal(reserved)}</td>
                  <td className="px-3 py-2 align-middle tabular-nums">{formatDecimal(physical)}</td>
                  <td className="px-3 py-2 align-middle tabular-nums">{formatDecimal(minStock)}</td>
                  <td className="px-3 py-2 align-middle">
                    {material.location?.trim() || "Sin ubicacion"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
