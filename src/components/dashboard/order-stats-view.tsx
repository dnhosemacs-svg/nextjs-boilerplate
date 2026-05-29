"use client";

import Link from "next/link";
import { useMemo } from "react";
import { QueryErrorState } from "@/components/inventory/query-error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrdersQuery } from "@/hooks/orders/use-orders-query";
import { computeOrderDashboardStats } from "@/lib/order-stats";
import type { UserRole } from "@/types/user-role";
import { UserRole as R } from "@/types/user-role";

type OrderStatsViewProps = {
  role: UserRole;
};

export function OrderStatsView({ role }: OrderStatsViewProps) {
  const isAdmin = role === R.ADMIN;
  const { data: orders = [], isLoading, isError, error, refetch } = useOrdersQuery();
  const stats = useMemo(() => computeOrderDashboardStats(orders), [orders]);

  const statCards = [
    { label: "Total pedidos", value: stats.total },
    { label: "Pendientes", value: stats.pending },
    { label: "En proceso", value: stats.inProgress },
    { label: "Entregados", value: stats.completed },
  ];

  return (
    <section className="surface-card stats-layout">
      <header className="stats-block flex flex-col gap-3">
        <p className="eyebrow">Resumen operativo</p>
        <h1 className="section-heading">Estadísticas del taller</h1>
        <p className="stats-description">
          {isAdmin
            ? "Métricas de todos los pedidos del taller."
            : "Métricas de los pedidos asignados a tu cuenta."}
        </p>
      </header>

      {isLoading ? (
        <div className="stats-grid stats-block">
          {statCards.map((card) => (
            <article key={card.label} className="stats-card">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-10 w-16" />
            </article>
          ))}
        </div>
      ) : null}

      {isError ? (
        <QueryErrorState
          error={error}
          fallbackMessage="No se pudieron cargar las estadísticas."
          onRetry={() => refetch()}
        />
      ) : null}

      {!isLoading && !isError ? (
        <>
          <div className="stats-grid stats-block">
            {statCards.map((card) => (
              <article key={card.label} className="stats-card">
                <p className="eyebrow">{card.label}</p>
                <p className="stats-value">{card.value}</p>
              </article>
            ))}
          </div>

          <article className="stats-highlight stats-block">
            <p className="eyebrow">Rendimiento</p>
            <p className="stats-highlight-label">Tasa de finalización (entregados / total):</p>
            <p className="stats-highlight-value">{stats.completionRate}%</p>
          </article>
        </>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard" className="ui-pill ui-pill-secondary">
          Volver al panel
        </Link>
        <Link href="/orders" className="ui-pill ui-pill-secondary">
          Ver pedidos
        </Link>
      </div>
    </section>
  );
}
