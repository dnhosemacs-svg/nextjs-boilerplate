"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ShortagesWidget } from "@/components/dashboard/shortages-widget";
import { OrderWorkerAssignment } from "@/components/orders/order-worker-assignment";
import { QueryErrorState } from "@/components/inventory/query-error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrdersQuery } from "@/hooks/orders/use-orders-query";
import { computeOrderDashboardStats } from "@/lib/order-stats";
import { formatOrderStatus } from "@/lib/order-status";
import { canManageUsers, canViewOperationalWidgets } from "@/lib/permissions";
import type { OrderDto } from "@/types/order";
import type { UserRole } from "@/types/user-role";
import { UserRole as R } from "@/types/user-role";

type WorkshopDashboardProps = {
  role: UserRole;
};

function orderTitle(order: OrderDto) {
  const params = order.params as Record<string, unknown>;
  const width = params?.ancho ?? params?.width;
  const height = params?.alto ?? params?.height;
  if (width && height) {
    return `${order.furnitureType} ${width}x${height} cm`;
  }
  return order.furnitureType;
}

function formatRelativeDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";

  const diffInMs = Date.now() - date.getTime();
  const dayMs = 1000 * 60 * 60 * 24;
  const diffInDays = Math.floor(diffInMs / dayMs);

  if (diffInDays <= 0) return "Hoy";
  if (diffInDays === 1) return "Ayer";
  if (diffInDays < 7) return `Hace ${diffInDays} días`;
  return date.toLocaleDateString("es-ES");
}

export function WorkshopDashboard({ role }: WorkshopDashboardProps) {
  const isAdmin = role === R.ADMIN;
  const showOps = canViewOperationalWidgets(role);
  const { data: orders = [], isLoading, isError, error, refetch } = useOrdersQuery();

  const stats = useMemo(() => computeOrderDashboardStats(orders), [orders]);
  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  return (
    <>
      <header className="dashboard-hero">
        <div className="flex flex-col gap-3">
          <h1 className="section-heading">Panel del taller</h1>
          <p className="content-description">
            {isAdmin
              ? "Todos los pedidos del taller. Asigna operarios para que aparezcan en su panel."
              : "Pedidos asignados a tu cuenta."}
          </p>
          {canManageUsers(role) ? (
            <Link href="/admin/users" className="ui-link-underline text-sm w-fit">
              Gestionar usuarios
            </Link>
          ) : null}
        </div>
      </header>

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
          <p className="eyebrow">En proceso</p>
          <p className="dashboard-kpi-value">{isLoading ? "—" : stats.inProgress}</p>
        </article>
        <article className="dashboard-kpi-card">
          <p className="eyebrow">Completados</p>
          <p className="dashboard-kpi-value">{isLoading ? "—" : stats.completed}</p>
        </article>
      </section>

      {showOps ? (
        <div className="dashboard-widgets-grid mb-8 space-y-6">
          <ShortagesWidget />
        </div>
      ) : null}

      <section className="surface-card dashboard-recent-section p-6">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="section-heading text-3xl dashboard-recent-title">Actividad reciente</h2>
          <Link href="/orders" className="ui-link-underline text-sm">
            Ver todos los pedidos
          </Link>
        </header>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-md" aria-hidden />
            ))}
          </div>
        ) : null}

        {isError ? (
          <QueryErrorState
            error={error}
            fallbackMessage="No se pudieron cargar los pedidos."
            onRetry={() => refetch()}
          />
        ) : null}

        {!isLoading && !isError && recentOrders.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            {isAdmin
              ? "No hay pedidos registrados o ninguno coincide con los filtros."
              : "No tienes pedidos asignados. El administrador debe asignarte trabajo."}
          </p>
        ) : null}

        {!isLoading && !isError && recentOrders.length > 0 ? (
          <ul className="dashboard-recent-list">
            {recentOrders.map((order) => (
              <li key={order.id} className="dashboard-recent-item">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{orderTitle(order)}</p>
                  <div className="dashboard-recent-meta">
                    <span className="ui-pill ui-pill-secondary text-xs">
                      {formatOrderStatus(order.status)}
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      {formatRelativeDate(order.updatedAt)}
                    </span>
                  </div>
                  {isAdmin ? (
                    <div className="mt-2">
                      <OrderWorkerAssignment order={order} compact />
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {order.assignedWorkers.length > 0
                        ? `Con: ${order.assignedWorkers.map((w) => w.name ?? w.email).join(", ")}`
                        : null}
                    </p>
                  )}
                </div>
                <div className="dashboard-recent-actions">
                  <Link href={`/orders/${order.id}`} className="ui-link-underline">
                    Ver detalle
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </>
  );
}
