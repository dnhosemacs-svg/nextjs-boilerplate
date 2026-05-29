"use client";

import { useQuery } from "@tanstack/react-query";
import { getLowStockMaterials } from "@/lib/inventory-api";
import { queryKeys } from "@/lib/query-keys";

export function useLowStockQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.dashboard.lowStock(),
    queryFn: () => getLowStockMaterials(),
    enabled,
  });
}
