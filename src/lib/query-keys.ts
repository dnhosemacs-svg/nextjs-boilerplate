import type { ProductListQuery } from "@/lib/validators/product";
import type { MaterialListQuery } from "@/lib/validators/material";
import type { OrderStatus } from "@/types/order-status";

export type OrderListQuery = Partial<{
  status: OrderStatus;
  furnitureType: string;
  clientId: string;
}>;

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
  orders: {
    all: ["orders"] as const,
    lists: () => [...queryKeys.orders.all, "list"] as const,
    list: (filters: OrderListQuery) => [...queryKeys.orders.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.orders.all, "detail", id] as const,
  },
};
