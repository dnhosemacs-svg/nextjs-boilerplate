"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateOrderMutation, useUpdateOrderMutation } from "@/hooks/orders/use-order-mutations";
import type { OrderDto } from "@/types/order";

type OrderFormProps = {
  mode: "create" | "edit";
  order?: OrderDto;
};

export function OrderForm({ mode, order }: OrderFormProps) {
  const router = useRouter();
  const createMutation = useCreateOrderMutation();
  const updateMutation = useUpdateOrderMutation();

  const [furnitureType, setFurnitureType] = useState(order?.furnitureType ?? "MESA");
  const [clientId, setClientId] = useState(order?.clientId ?? "");
  const [notes, setNotes] = useState(order?.notes ?? "");
  const [paramsText, setParamsText] = useState(
    JSON.stringify(order?.params ?? { ancho: 120, alto: 75, fondo: 60 }, null, 2),
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  function parseParams() {
    try {
      const parsed = JSON.parse(paramsText);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Los params deben ser un objeto JSON");
      }
      setJsonError(null);
      return parsed as Record<string, unknown>;
    } catch (error) {
      const message = error instanceof Error ? error.message : "JSON de params no válido";
      setJsonError(message);
      return null;
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = parseParams();
    if (!params) return;

    if (mode === "create") {
      createMutation.mutate(
        {
          furnitureType: furnitureType.trim().toUpperCase(),
          params,
          notes: notes.trim() || undefined,
          clientId: clientId.trim() || undefined,
        },
        {
          onSuccess: (created) => {
            router.push(`/orders/${created.id}`);
          },
        },
      );
      return;
    }

    if (!order) return;

    updateMutation.mutate(
      {
        id: order.id,
        input: {
          furnitureType: furnitureType.trim().toUpperCase(),
          params,
          notes: notes.trim() || null,
        },
      },
      {
        onSuccess: () => {
          router.refresh();
        },
      },
    );
  }

  const mutationError = createMutation.error?.message ?? updateMutation.error?.message ?? null;
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Tipo de mueble (ej. MESA)"
        value={furnitureType}
        onChange={(e) => setFurnitureType(e.target.value)}
      />
      <p className="-mt-2 text-xs text-[var(--muted)]">
        Usa tipos válidos como MESA, ARMARIO, ESTANTERIA o CAJONERA.
      </p>
      {mode === "create" ? (
        <Input
          placeholder="clientId (opcional para ADMIN/WORKER)"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        />
      ) : null}
      <Textarea
        rows={8}
        value={paramsText}
        onChange={(e) => setParamsText(e.target.value)}
        placeholder='{"ancho":120,"alto":75}'
      />
      <Textarea
        rows={4}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notas"
      />

      {jsonError ? <p className="text-sm text-destructive">{jsonError}</p> : null}
      {mutationError ? <p className="text-sm text-destructive">{mutationError}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : mode === "create" ? "Crear pedido" : "Guardar cambios"}
      </Button>
    </form>
  );
}
