"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirmOrderActualConsumptionMutation } from "@/hooks/orders/use-order-mutations";
import type { OrderDto } from "@/types/order";

type OrderRealConsumptionEditorProps = {
  order: OrderDto;
};

type DraftActualLine = {
  materialId: string;
  plannedQty: string;
  actualQty: string;
};

function buildDraftLines(order: OrderDto): DraftActualLine[] {
  return order.materialLines.map((line) => ({
    materialId: line.materialId,
    plannedQty: line.plannedQty,
    actualQty: line.actualQty ?? line.plannedQty,
  }));
}

export function OrderRealConsumptionEditor({ order }: OrderRealConsumptionEditorProps) {
  const mutation = useConfirmOrderActualConsumptionMutation();
  const [lines, setLines] = useState<DraftActualLine[]>(buildDraftLines(order));
  const [formError, setFormError] = useState<string | null>(null);

  const hasOverrun = useMemo(
    () => lines.some((line) => Number(line.actualQty) > Number(line.plannedQty)),
    [lines],
  );

  function setActualQty(materialId: string, nextValue: string) {
    setLines((current) =>
      current.map((line) => (line.materialId === materialId ? { ...line, actualQty: nextValue } : line)),
    );
  }

  function resetForm() {
    setLines(buildDraftLines(order));
    setFormError(null);
  }

  function handleConfirm() {
    const normalized = lines.map((line) => ({
      materialId: line.materialId,
      actualQty: Number(line.actualQty),
      plannedQty: Number(line.plannedQty),
    }));

    if (normalized.length === 0) {
      setFormError("No hay líneas de materiales para registrar consumo real.");
      return;
    }

    if (normalized.some((line) => !Number.isFinite(line.actualQty) || line.actualQty <= 0)) {
      setFormError("Todas las cantidades reales deben ser mayores que cero.");
      return;
    }

    setFormError(null);
    mutation.mutate({
      id: order.id,
      input: {
        lines: normalized.map((line) => ({
          materialId: line.materialId,
          actualQty: line.actualQty,
        })),
      },
    });
  }

  return (
    <section className="space-y-3 rounded-lg border border-border p-4">
      <h2 className="text-sm font-semibold">Consumo real</h2>
      <p className="text-xs text-[var(--muted)]">
        Registra la cantidad realmente consumida por línea antes de cerrar el trabajo.
      </p>

      {hasOverrun ? (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-700">
          Hay líneas con consumo real superior al planificado. Se permitirá al confirmar y quedará
          registrado como exceso.
        </p>
      ) : null}

      <div className="space-y-2">
        {lines.map((line) => (
          <div key={line.materialId} className="grid grid-cols-1 gap-2 md:grid-cols-12">
            <div className="rounded-md border border-border px-2.5 py-2 text-xs md:col-span-6">
              <p className="font-medium">Material {line.materialId}</p>
              <p className="text-[var(--muted)]">Planificado: {line.plannedQty}</p>
            </div>

            <Input
              className="md:col-span-6"
              type="number"
              min="0"
              step="0.001"
              placeholder="Cantidad real"
              value={line.actualQty}
              onChange={(e) => setActualQty(line.materialId, e.target.value)}
              disabled={mutation.isPending}
            />
          </div>
        ))}
      </div>

      {formError ? <p className="text-xs text-destructive">{formError}</p> : null}
      {mutation.error ? <p className="text-xs text-destructive">{mutation.error.message}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={resetForm} disabled={mutation.isPending}>
          Revertir
        </Button>
        <Button type="button" onClick={handleConfirm} disabled={mutation.isPending || lines.length === 0}>
          {mutation.isPending ? "Confirmando..." : "Confirmar consumo real"}
        </Button>
      </div>
    </section>
  );
}
