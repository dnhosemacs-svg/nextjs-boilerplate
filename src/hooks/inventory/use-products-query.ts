"use client";

import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/inventory-api";
import { queryKeys } from "@/lib/query-keys";
import { useUiStore } from "@/stores/ui-store";

export function useProductsQuery() {
  const filters = useUiStore((s) => s.productFilters);

  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => getProducts(filters),
  });
}
