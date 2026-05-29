"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrderMovements } from "@/lib/orders-api";
import { queryKeys } from "@/lib/query-keys";

export function useOrderMovementsQuery(orderId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.dashboard.orderMovements(orderId),
    queryFn: () => getOrderMovements(orderId),
    enabled: enabled && !!orderId,
  });
}
