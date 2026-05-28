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
};

export function OrderList({ orders }: OrderListProps) {
  if (!orders.length) {
    return <p className="text-sm text-[var(--muted)]">No hay pedidos para los filtros actuales.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Tipo mueble</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Creado</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>{order.id.slice(0, 10)}...</TableCell>
            <TableCell>{order.status}</TableCell>
            <TableCell>{order.furnitureType}</TableCell>
            <TableCell>{order.clientId}</TableCell>
            <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
            <TableCell>
              <Link href={`/orders/${order.id}`} className="ui-pill ui-pill-secondary">
                Ver detalle
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
