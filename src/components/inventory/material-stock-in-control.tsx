"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRecordStockInMutation } from "@/hooks/inventory";

type MaterialStockInControlProps = {
  materialId: string;
};

export function MaterialStockInControl({ materialId }: MaterialStockInControlProps) {
  const [quantity, setQuantity] = useState("1");
  const mutation = useRecordStockInMutation();

  const parsedQuantity = Number(quantity);
  const isValid = Number.isFinite(parsedQuantity) && parsedQuantity > 0;

  function handleSubmit() {
    if (!isValid || mutation.isPending) return;

    mutation.mutate(
      { materialId, quantity: parsedQuantity },
      { onSuccess: () => setQuantity("1") },
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min={1}
          step="any"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          className="h-8 w-16 px-2"
          aria-label="Cantidad de entrada"
          disabled={mutation.isPending}
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={!isValid || mutation.isPending}
          onClick={handleSubmit}
        >
          {mutation.isPending ? "..." : "Entrada"}
        </Button>
      </div>
      {mutation.isError ? (
        <p className="max-w-[9rem] text-xs text-destructive">{mutation.error.message}</p>
      ) : null}
    </div>
  );
}
