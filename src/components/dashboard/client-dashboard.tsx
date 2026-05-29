"use client";

import Link from "next/link";
import { useMemo } from "react";
import { OrderList } from "@/components/orders/order-list";
import { QueryErrorState } from "@/components/inventory/query-error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrdersQuery } from "@/hooks/orders/use-orders-query";
import { OrderStatus } from "@/types/order-status";

const PENDING_STATUSES = new Set<string>([OrderStatus.DRAFT, OrderStatus.PENDING]);
const IN_PROGRESS_STATUSES = new Set<string>([
  OrderStatus.APPROVED,
  OrderStatus.IN_PRODUCTION,
  OrderStatus.READY,
]);

export function ClientDashboard() {
  const { data: orders = [], isLoading, isError, error, refetch } = useOrdersQuery();

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => PENDING_STATUSES.has(o.status)).length;
    const inProgress = orders.filter((o) => IN_PROGRESS_STATUSES.has(o.status)).length;
    const delivered = orders.filter((o) => o.status === OrderStatus.DELIVERED).length;
    return { total, pending, inProgress, delivered };
  }, [orders]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  return (
    <div className="space-y-6">
      <section className="dashboard-kpi-grid">
        <article className="dashboard-kpi-card">
          <p className="eyebrow">Total pedidos</p>
          <p className="dashboard-kpi-value">{isLoading ? "—" : stats.total}</p>
        </article>
        <article className="dashboard-kpi-card">
          <p className="eyebrow">Pendientes</p>
          <p className="dashboard-kpi-value">{isLoading ? "—" : stats.pending}</p>
        </article>
        <article className="dashboard-kpi-card">
          <p className="eyebrow">En curso</p>
          <p className="dashboard-kpi-value">{isLoading ? "—" : stats.inProgress}</p>
        </article>
        <article className="dashboard-kpi-card">
          <p className="eyebrow">Entregados</p>
          <p className="dashboard-kpi-value">{isLoading ? "—" : stats.delivered}</p>
        </article>
      </section>

      <section className="surface-card dashboard-recent-section p-6">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="section-heading text-3xl dashboard-recent-title">Pedidos recientes</h2>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/my-orders" className="ui-link-underline">
              Ver todos
            </Link>
            <Link href="/orders/new" className="ui-link-underline">
              Nuevo pedido
            </Link>
          </div>
        </header>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-md" aria-hidden />
            ))}
          </div>
        ) : null}

        {isError ? (
          <QueryErrorState
            error={error}
            fallbackMessage="No se pudieron cargar tus pedidos."
            onRetry={() => refetch()}
          />
        ) : null}

        {!isLoading && !isError ? (
          recentOrders.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              Aún no tienes pedidos.{" "}
              <Link href="/orders/new" className="ui-link-underline">
                Crea el primero
              </Link>
              .
            </p>
          ) : (
            <OrderList orders={recentOrders} mode="client" />
          )
        ) : null}
      </section>
    </div>
  );
}
