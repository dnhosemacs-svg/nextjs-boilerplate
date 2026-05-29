"use client";

import Link from "next/link";
import { QueryErrorState } from "@/components/inventory/query-error-state";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLowStockQuery } from "@/hooks/dashboard/use-low-stock-query";

function formatDecimal(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(n);
}

export function LowStockWidget() {
  const { data, isLoading, isError, error, refetch } = useLowStockQuery();

  return (
    <section className="surface-card dashboard-widget">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="section-heading text-xl">Materiales bajo stock mínimo</h2>
        <Link href="/products" className="ui-link-underline text-sm">
          Ir a inventario
        </Link>
      </header>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full rounded-md" aria-hidden />
          ))}
        </div>
      ) : null}

      {isError ? (
        <QueryErrorState
          error={error}
          fallbackMessage="No se pudieron cargar los materiales bajo stock."
          onRetry={() => refetch()}
        />
      ) : null}

      {!isLoading && !isError && data ? (
        data.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            No hay materiales por debajo del stock mínimo.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Disponible</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Unidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.material.id}>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{item.material.name}</span>
                      <Badge variant="destructive">Stock bajo</Badge>
                    </div>
                    {item.material.sku ? (
                      <p className="text-xs text-muted-foreground">SKU: {item.material.sku}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="tabular-nums">{formatDecimal(item.available)}</TableCell>
                  <TableCell className="tabular-nums">{formatDecimal(item.minStock)}</TableCell>
                  <TableCell>{item.material.unit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      ) : null}
    </section>
  );
}
