"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getMaterialMovements, type StockMovementItem } from "@/lib/inventory-api";
import { formatDate, formatDecimal } from "./material-list-formatters";
import { QueryErrorState } from "./query-error-state";

type MaterialMovementsDialogProps = {
  materialId?: string;
  materialName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MaterialMovementsDialog({
  materialId,
  materialName,
  open,
  onOpenChange,
}: MaterialMovementsDialogProps) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["materials", "movements", materialId],
    queryFn: () => getMaterialMovements(materialId!),
    enabled: open && !!materialId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Historial de movimientos</DialogTitle>
          <DialogDescription>
            {materialName ? `Material: ${materialName}` : "Movimientos del material"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <MaterialMovementSkeleton />
        ) : isError ? (
          <QueryErrorState
            error={error}
            fallbackMessage="Error al cargar movimientos"
            onRetry={() => refetch()}
          />
        ) : (
          <MaterialMovementsTable rows={data ?? []} isFetching={isFetching} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function MaterialMovementSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-md" aria-hidden />
      ))}
    </div>
  );
}

function movementTypeLabel(type: StockMovementItem["type"]) {
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

function MaterialMovementsTable({
  rows,
  isFetching,
}: {
  rows: StockMovementItem[];
  isFetching: boolean;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay movimientos para este material.</p>;
  }

  return (
    <div className="space-y-2">
      {isFetching ? <p className="text-xs text-muted-foreground">Actualizando...</p> : null}
      <div className="max-h-[420px] overflow-auto rounded-md border">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Fecha</th>
              <th className="px-3 py-2 text-left font-medium">Tipo</th>
              <th className="px-3 py-2 text-left font-medium">Cantidad</th>
              <th className="px-3 py-2 text-left font-medium">Motivo</th>
              <th className="px-3 py-2 text-left font-medium">Pedido</th>
              <th className="px-3 py-2 text-left font-medium">Usuario</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="px-3 py-2 align-middle">{formatDate(row.createdAt)}</td>
                <td className="px-3 py-2 align-middle">{movementTypeLabel(row.type)}</td>
                <td className="px-3 py-2 align-middle tabular-nums">{formatDecimal(row.quantity)}</td>
                <td className="px-3 py-2 align-middle">{row.reason?.trim() || "-"}</td>
                <td className="px-3 py-2 align-middle">{row.orderId ?? "-"}</td>
                <td className="px-3 py-2 align-middle">{row.userId ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
