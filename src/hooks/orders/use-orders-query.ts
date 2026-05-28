"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/lib/orders-api";
import { queryKeys, type OrderListQuery } from "@/lib/query-keys";

export function useOrdersQuery(filters: OrderListQuery = {}) {
  return useQuery({
    queryKey: queryKeys.orders.list(filters),
    queryFn: () => getOrders(filters),
  });
}
