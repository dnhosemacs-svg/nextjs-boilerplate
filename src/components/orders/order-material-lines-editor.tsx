"use client";

import { useMemo, useState } from "react";

import { buildTemplateDraftLines } from "@/lib/bom-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMaterialsQuery } from "@/hooks/inventory/use-materials-query";
import { useSetOrderMaterialLinesMutation } from "@/hooks/orders/use-order-mutations";
import type { OrderDto } from "@/types/order";
import type { FurnitureType } from "@/lib/validators/order";

type OrderMaterialLinesEditorProps = {
  order: OrderDto;
};

type DraftLine = {
  materialId: string;
  plannedQty: string;
};

function buildDraftLines(order: OrderDto): DraftLine[] {
  if (order.materialLines.length === 0) return [{ materialId: "", plannedQty: "" }];
  return order.materialLines.map((line) => ({
    materialId: line.materialId,
    plannedQty: line.plannedQty,
  }));
}

export function OrderMaterialLinesEditor({ order }: OrderMaterialLinesEditorProps) {
  const materialsQuery = useMaterialsQuery({
    search: undefined,
    categoryId: undefined,
    sortBy: "name",
    sortOrder: "asc",
  });
  const saveLinesMutation = useSetOrderMaterialLinesMutation();
  const [lines, setLines] = useState<DraftLine[]>(buildDraftLines(order));
  const [formError, setFormError] = useState<string | null>(null);

  const materialOptions = useMemo(() => materialsQuery.data ?? [], [materialsQuery.data]);
  const hasPendingChanges = useMemo(() => {
    const current = lines.map((line) => ({
      materialId: line.materialId.trim(),
      plannedQty: line.plannedQty.trim(),
    }));
    const initial = buildDraftLines(order).map((line) => ({
      materialId: line.materialId.trim(),
      plannedQty: line.plannedQty.trim(),
    }));
    return JSON.stringify(current) !== JSON.stringify(initial);
  }, [lines, order]);

  function updateLine(index: number, patch: Partial<DraftLine>) {
    setLines((current) =>
      current.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    );
  }

  function addLine() {
    setLines((current) => [...current, { materialId: "", plannedQty: "" }]);
  }

  function removeLine(index: number) {
    setLines((current) => {
      if (current.length === 1) return current;
      return current.filter((_, i) => i !== index);
    });
  }

  function handleSave() {
    const normalized = lines.map((line) => ({
      materialId: line.materialId.trim(),
      plannedQty: Number(line.plannedQty),
    }));

    if (normalized.some((line) => !line.materialId)) {
      setFormError("Todas las líneas deben tener material.");
      return;
    }
    if (normalized.some((line) => !Number.isFinite(line.plannedQty) || line.plannedQty <= 0)) {
      setFormError("Las cantidades planificadas deben ser mayores que cero.");
      return;
    }

    const unique = new Set(normalized.map((line) => line.materialId));
    if (unique.size !== normalized.length) {
      setFormError("No se puede repetir el mismo material.");
      return;
    }

    setFormError(null);
    saveLinesMutation.mutate({
      id: order.id,
      input: { lines: normalized },
    });
  }

  function handleLoadTemplate() {
    const templateLines = buildTemplateDraftLines({
      furnitureType: order.furnitureType as FurnitureType,
      params: (order.params as Record<string, unknown>) ?? {},
      materials: materialOptions,
    });

    if (templateLines.length === 0) {
      setFormError(
        "No se pudo cargar plantilla. Verifica tipo de mueble, params y materiales base (M2, M, UD).",
      );
      return;
    }

    setFormError(null);
    setLines(
      templateLines.map((line) => ({
        materialId: line.materialId,
        plannedQty: String(line.plannedQty),
      })),
    );
  }

  const mutationError = saveLinesMutation.error?.message ?? null;
  const isPending = saveLinesMutation.isPending;

  return (
    <section className="space-y-3 rounded-lg border border-border p-4">
      <h2 className="text-sm font-semibold">Planificación de materiales</h2>

      {materialsQuery.isLoading ? (
        <p className="text-xs text-[var(--muted)]">Cargando materiales...</p>
      ) : null}
      {materialsQuery.error ? (
        <p className="text-xs text-destructive">{materialsQuery.error.message}</p>
      ) : null}

      <div className="space-y-2">
        {lines.map((line, index) => (
          <div key={`${index}-${line.materialId}`} className="grid grid-cols-1 gap-2 md:grid-cols-12">
            <select
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm md:col-span-7"
              value={line.materialId}
              onChange={(e) => updateLine(index, { materialId: e.target.value })}
              disabled={isPending}
            >
              <option value="">Selecciona material</option>
              {materialOptions.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.name} ({material.unit}) - {material.unitCost} EUR
                </option>
              ))}
            </select>

            <Input
              className="md:col-span-3"
              type="number"
              min="0"
              step="0.001"
              placeholder="Cantidad"
              value={line.plannedQty}
              onChange={(e) => updateLine(index, { plannedQty: e.target.value })}
              disabled={isPending}
            />

            <Button
              type="button"
              variant="outline"
              className="md:col-span-2"
              onClick={() => removeLine(index)}
              disabled={isPending || lines.length === 1}
            >
              Quitar
            </Button>
          </div>
        ))}
      </div>

      {formError ? <p className="text-xs text-destructive">{formError}</p> : null}
      {mutationError ? <p className="text-xs text-destructive">{mutationError}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleLoadTemplate}
          disabled={isPending || materialOptions.length === 0}
        >
          Cargar plantilla
        </Button>
        <Button type="button" variant="outline" onClick={addLine} disabled={isPending}>
          Anadir linea
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setLines(buildDraftLines(order));
            setFormError(null);
          }}
          disabled={isPending || !hasPendingChanges}
        >
          Revertir cambios
        </Button>
        <Button type="button" onClick={handleSave} disabled={isPending || materialOptions.length === 0}>
          {isPending ? "Guardando..." : "Guardar lineas"}
        </Button>
      </div>
    </section>
  );
}
