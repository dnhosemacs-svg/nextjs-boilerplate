"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/lib/orders-api";
import { queryKeys } from "@/lib/query-keys";

export function useShortagesOrdersQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.dashboard.shortages(),
    queryFn: () => getOrders({ hasShortages: true }),
    enabled,
  });
}
