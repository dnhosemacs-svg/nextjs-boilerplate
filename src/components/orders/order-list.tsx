"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OrderDto } from "@/types/order";

type OrderListProps = {
  orders: OrderDto[];
  mode?: "internal" | "client";
};

function clientSummary(order: OrderDto): string {
  const params = order.params as Record<string, unknown>;
  const width = params?.ancho ?? params?.width;
  const height = params?.alto ?? params?.height;

  if (width && height) {
    return `${order.furnitureType} ${width}x${height} cm`;
  }

  return order.furnitureType;
}

function orderTotal(order: OrderDto): string {
  const materialTotal = Number(order.materialsSubtotal);
  const laborTotal = Number(order.laborAmount ?? "0");
  return (materialTotal + laborTotal).toFixed(2);
}

export function OrderList({ orders, mode = "internal" }: OrderListProps) {
  const isClientMode = mode === "client";

  if (!orders.length) {
    return <p className="text-sm text-[var(--muted)]">No hay pedidos para los filtros actuales.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>{isClientMode ? "Resumen" : "Tipo mueble"}</TableHead>
          <TableHead>{isClientMode ? "Total" : "Cliente"}</TableHead>
          <TableHead>Creado</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>{order.id.slice(0, 10)}...</TableCell>
            <TableCell>{order.status}</TableCell>
            <TableCell>{isClientMode ? clientSummary(order) : order.furnitureType}</TableCell>
            <TableCell>{isClientMode ? `${orderTotal(order)} EUR` : order.clientId}</TableCell>
            <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
            <TableCell>
              <Link
                href={isClientMode ? `/my-orders/${order.id}` : `/orders/${order.id}`}
                className="ui-pill ui-pill-secondary"
              >
                Ver detalle
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
