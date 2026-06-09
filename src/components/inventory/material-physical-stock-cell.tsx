"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useUpdateMaterialPhysicalMutation } from "@/hooks/inventory";

type MaterialPhysicalStockCellProps = {
  materialId: string;
  physical: string;
};

function toEditableValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(parsed) : "0";
}

export function MaterialPhysicalStockCell({
  materialId,
  physical,
}: MaterialPhysicalStockCellProps) {
  const [value, setValue] = useState(() => toEditableValue(physical));
  const isTypingRef = useRef(false);
  const mutation = useUpdateMaterialPhysicalMutation();

  useEffect(() => {
    if (!mutation.isPending) {
      setValue(toEditableValue(physical));
    }
  }, [physical, mutation.isPending]);

  function commit(nextValue?: string) {
    const previousPhysical = Number(toEditableValue(physical));
    const newPhysical = Number(nextValue ?? value);

    if (!Number.isFinite(newPhysical) || newPhysical < 0) {
      setValue(toEditableValue(physical));
      return;
    }

    if (newPhysical === previousPhysical) return;

    mutation.mutate(
      { materialId, previousPhysical, newPhysical },
      { onError: () => setValue(toEditableValue(physical)) },
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Input
        type="number"
        min={0}
        step={1}
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          setValue(next);
          if (!isTypingRef.current) {
            commit(next);
          }
        }}
        onBlur={() => {
          isTypingRef.current = false;
          commit();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
            return;
          }
          if (event.key === "Escape") {
            isTypingRef.current = false;
            setValue(toEditableValue(physical));
            event.currentTarget.blur();
            return;
          }
          if (
            event.key.length === 1 ||
            event.key === "Backspace" ||
            event.key === "Delete"
          ) {
            isTypingRef.current = true;
          }
        }}
        className="h-8 w-20 px-2 tabular-nums"
        disabled={mutation.isPending}
        aria-label="Stock físico"
      />
      {mutation.isPending ? (
        <p className="text-xs text-muted-foreground">Guardando...</p>
      ) : null}
      {mutation.isError ? (
        <p className="max-w-[9rem] text-xs text-destructive">{mutation.error.message}</p>
      ) : null}
    </div>
  );
}
