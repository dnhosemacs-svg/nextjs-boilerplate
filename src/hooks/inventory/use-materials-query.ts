"use client";

import { useQuery } from "@tanstack/react-query";
import { getMaterials } from "@/lib/inventory-api";
import { queryKeys } from "@/lib/query-keys";
import type { MaterialListQuery } from "@/lib/validators/material";

export function useMaterialsQuery(filters: MaterialListQuery) {
  return useQuery({
    queryKey: queryKeys.materials.list(filters),
    queryFn: () => getMaterials(filters),
  });
}
