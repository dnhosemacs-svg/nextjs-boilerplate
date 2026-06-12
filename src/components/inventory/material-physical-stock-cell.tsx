"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useUpdateMaterialPhysicalMutation } from "@/hooks/inventory";

const SAVE_DEBOUNCE_MS = 1000;

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
  const inputRef = useRef<HTMLInputElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mutation = useUpdateMaterialPhysicalMutation();

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setValue(toEditableValue(physical));
  }, [physical]);

  function clearScheduledSave() {
    if (!saveTimerRef.current) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = null;
  }

  function commit(nextValue?: string) {
    clearScheduledSave();

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

  function scheduleCommit(nextValue: string) {
    clearScheduledSave();
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      commit(nextValue);
    }, SAVE_DEBOUNCE_MS);
  }

  return (
    <div className="flex flex-col gap-1">
      <Input
        ref={inputRef}
        type="number"
        min={0}
        step={1}
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          setValue(nextValue);
          scheduleCommit(nextValue);
        }}
        onBlur={() => {
          window.setTimeout(() => {
            if (inputRef.current === document.activeElement) return;
            scheduleCommit(inputRef.current?.value ?? value);
          }, 0);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            clearScheduledSave();
            commit(event.currentTarget.value);
            event.currentTarget.blur();
            return;
          }
          if (event.key === "Escape") {
            clearScheduledSave();
            setValue(toEditableValue(physical));
            event.currentTarget.blur();
          }
        }}
        className="h-8 w-20 px-2 tabular-nums"
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
