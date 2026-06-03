"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderList } from "@/components/orders/order-list";
import { useOrdersQuery } from "@/hooks/orders/use-orders-query";
import type { OrderStatus } from "@/types/order-status";
import { UserRole } from "@/types/user-role";

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
const ALL_STATUSES = "__all__";

type OrdersViewProps = {
  mode?: "internal" | "client";
};

export function OrdersView({ mode = "internal" }: OrdersViewProps) {
  const isClientMode = mode === "client";
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === UserRole.ADMIN;
  const [status, setStatus] = useState<"" | OrderStatus>("");
  const [furnitureType, setFurnitureType] = useState("");
  const [clientId, setClientId] = useState("");
  const [unassignedOnly, setUnassignedOnly] = useState(false);

  const query = useOrdersQuery({
    status: status || undefined,
    furnitureType: furnitureType.trim() || undefined,
    clientId: isClientMode ? undefined : (clientId.trim() || undefined),
    unassigned: isAdmin && unassignedOnly ? true : undefined,
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

      <div className="workshop-list-section">
      <div
        className={`workshop-filters-bar grid grid-cols-1 gap-3 ${isClientMode ? "md:grid-cols-2" : "md:grid-cols-3"}`}
      >
        <Select
          value={status || ALL_STATUSES}
          onValueChange={(value) =>
            setStatus(value === ALL_STATUSES ? "" : (value as OrderStatus))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos los estados">
              {status
                ? (ORDER_STATUS_OPTIONS.find((o) => o.value === status)?.label ??
                  status)
                : "Todos los estados"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUS_OPTIONS.map((option) => (
              <SelectItem
                key={option.label}
                value={option.value === "" ? ALL_STATUSES : option.value}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      {isAdmin ? (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={unassignedOnly}
            onChange={(e) => setUnassignedOnly(e.target.checked)}
          />
          Solo pedidos sin operario asignado
        </label>
      ) : null}

      {query.isLoading ? <p className="text-sm text-[var(--muted)]">Cargando pedidos...</p> : null}
      {query.error ? <p className="text-sm text-destructive">{query.error.message}</p> : null}
      {query.data ? <OrderList orders={query.data} mode={mode} /> : null}
      </div>
    </section>
  );
}
