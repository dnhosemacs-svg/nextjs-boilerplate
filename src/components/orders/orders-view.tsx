"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { OrderList } from "@/components/orders/order-list";
import { useOrdersQuery } from "@/hooks/orders/use-orders-query";
import type { OrderStatus } from "@/types/order-status";

const ORDER_STATUS_OPTIONS: Array<{ value: "" | OrderStatus; label: string }> = [
  { value: "", label: "Todos los estados" },
  { value: "DRAFT", label: "DRAFT" },
  { value: "PENDING", label: "PENDING" },
  { value: "APPROVED", label: "APPROVED" },
  { value: "IN_PRODUCTION", label: "IN_PRODUCTION" },
  { value: "READY", label: "READY" },
  { value: "DELIVERED", label: "DELIVERED" },
  { value: "CANCELLED", label: "CANCELLED" },
];

type OrdersViewProps = {
  mode?: "internal" | "client";
};

export function OrdersView({ mode = "internal" }: OrdersViewProps) {
  const isClientMode = mode === "client";
  const [status, setStatus] = useState<"" | OrderStatus>("");
  const [furnitureType, setFurnitureType] = useState("");
  const [clientId, setClientId] = useState("");

  const query = useOrdersQuery({
    status: status || undefined,
    furnitureType: furnitureType.trim() || undefined,
    clientId: isClientMode ? undefined : (clientId.trim() || undefined),
  });

  return (
    <section className="surface-card">
      <header className="mb-8 flex flex-col gap-3 md:mb-10">
        <h1 className="section-heading">{isClientMode ? "Mis pedidos" : "Pedidos"}</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          {isClientMode
            ? "Consulta el estado de tus pedidos y su resumen de importes."
            : "Listado de pedidos con filtros por estado, cliente y tipo de mueble."}
        </p>
      </header>

      <div className={`mb-5 grid grid-cols-1 gap-3 ${isClientMode ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
        <select
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as "" | OrderStatus)}
        >
          {ORDER_STATUS_OPTIONS.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Input
          placeholder="Filtrar por tipo de mueble"
          value={furnitureType}
          onChange={(e) => setFurnitureType(e.target.value)}
        />
        {isClientMode ? null : (
          <Input
            placeholder="Filtrar por clientId"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          />
        )}
      </div>

      {query.isLoading ? <p className="text-sm text-[var(--muted)]">Cargando pedidos...</p> : null}
      {query.error ? <p className="text-sm text-destructive">{query.error.message}</p> : null}
      {query.data ? <OrderList orders={query.data} mode={mode} /> : null}
    </section>
  );
}
