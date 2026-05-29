"use client";

import Link from "next/link";
import { OrderList } from "@/components/orders/order-list";
import { QueryErrorState } from "@/components/inventory/query-error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useShortagesOrdersQuery } from "@/hooks/dashboard/use-shortages-query";

export function ShortagesWidget() {
  const { data, isLoading, isError, error, refetch } = useShortagesOrdersQuery();

  return (
    <section className="surface-card dashboard-widget">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="section-heading text-xl">Pedidos con faltantes</h2>
        <Link href="/orders" className="ui-link-underline text-sm">
          Ver todos los pedidos
        </Link>
      </header>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full rounded-md" aria-hidden />
          ))}
        </div>
      ) : null}

      {isError ? (
        <QueryErrorState
          error={error}
          fallbackMessage="No se pudieron cargar los pedidos con faltantes."
          onRetry={() => refetch()}
        />
      ) : null}

      {!isLoading && !isError && data ? (
        data.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No hay pedidos con faltantes de material.</p>
        ) : (
          <OrderList orders={data} mode="internal" />
        )
      ) : null}
    </section>
  );
}
