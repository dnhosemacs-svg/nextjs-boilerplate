"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "@/lib/orders-api";
import { queryKeys } from "@/lib/query-keys";

export function useOrderQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => getOrderById(id),
    enabled: Boolean(id),
  });
}
