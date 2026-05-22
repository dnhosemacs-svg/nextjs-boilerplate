"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/inventory-api";
import { queryKeys } from "@/lib/query-keys";

/** Categorías cambian poco: 10 min fresh (productos usan DEFAULT_STALE_TIME_MS = 2 min). */
const CATEGORIES_STALE_TIME = 10 * 60 * 1000;

export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: getCategories,
    staleTime: CATEGORIES_STALE_TIME,
  });
}
