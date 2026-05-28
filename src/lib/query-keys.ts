import type { ProductListQuery } from "@/lib/validators/product";
import type { MaterialListQuery } from "@/lib/validators/material";

export const queryKeys = {
  products: {
    all: ["products"] as const,
    lists: () => [...queryKeys.products.all, "list"] as const,
    list: (filters: ProductListQuery) =>
      [...queryKeys.products.lists(), filters] as const,
  },
  materials: {
    all: ["materials"] as const,
    lists: () => [...queryKeys.materials.all, "list"] as const,
    list: (filters: MaterialListQuery) =>
      [...queryKeys.materials.lists(), filters] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: () => [...queryKeys.categories.all, "list"] as const,
  },
  users: {
    all: ["users"] as const,
    list: () => [...queryKeys.users.all, "list"] as const,
  },
};
