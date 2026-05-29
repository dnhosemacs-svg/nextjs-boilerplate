"use client";

import { QueryErrorState } from "@/components/inventory/query-error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrderMovementsQuery } from "@/hooks/dashboard/use-order-movements-query";
import type { OrderStockMovementDto } from "@/types/stock";

type OrderMovementsPanelProps = {
  orderId: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatDecimal(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(n);
}

function movementTypeLabel(type: OrderStockMovementDto["type"]) {
  switch (type) {
    case "IN":
      return "Entrada";
    case "OUT":
      return "Salida";
    case "ADJUST":
      return "Ajuste";
    case "RESERVE":
      return "Reserva";
    case "RELEASE":
      return "Liberacion";
    default:
      return type;
  }
}

export function OrderMovementsPanel({ orderId }: OrderMovementsPanelProps) {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useOrderMovementsQuery(orderId);

  return (
    <section className="space-y-3 rounded-lg border border-border/60 p-4">
      <header>
        <h2 className="text-sm font-semibold">Historial de movimientos</h2>
        <p className="text-xs text-[var(--muted)]">
          Movimientos de stock vinculados a este pedido.
        </p>
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
          fallbackMessage="No se pudo cargar el historial de movimientos."
          onRetry={() => refetch()}
        />
      ) : null}

      {!isLoading && !isError ? (
        <>
          {isFetching ? (
            <p className="text-xs text-muted-foreground">Actualizando...</p>
          ) : null}
          {!data?.length ? (
            <p className="text-sm text-[var(--muted)]">
              No hay movimientos registrados para este pedido.
            </p>
          ) : (
            <div className="max-h-[420px] overflow-auto rounded-md border">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Fecha</th>
                    <th className="px-3 py-2 text-left font-medium">Tipo</th>
                    <th className="px-3 py-2 text-left font-medium">Material</th>
                    <th className="px-3 py-2 text-left font-medium">Cantidad</th>
                    <th className="px-3 py-2 text-left font-medium">Motivo</th>
                    <th className="px-3 py-2 text-left font-medium">Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="px-3 py-2 align-middle">{formatDate(row.createdAt)}</td>
                      <td className="px-3 py-2 align-middle">{movementTypeLabel(row.type)}</td>
                      <td className="px-3 py-2 align-middle">{row.materialName}</td>
                      <td className="px-3 py-2 align-middle tabular-nums">
                        {formatDecimal(row.quantity)}
                      </td>
                      <td className="px-3 py-2 align-middle">{row.reason?.trim() || "-"}</td>
                      <td className="px-3 py-2 align-middle">{row.userId ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
