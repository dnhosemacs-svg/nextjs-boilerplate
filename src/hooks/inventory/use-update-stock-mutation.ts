"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProductStock } from "@/lib/inventory-api";
import { queryKeys } from "@/lib/query-keys";
import type { Product } from "@/types/inventory";
import type { UpdateProductStockInput } from "@/lib/validators/product";

type StockMutationVariables = {
  id: string;
  input: UpdateProductStockInput;
};

type StockMutationContext = {
  snapshots: [readonly unknown[], Product[] | undefined][];
};

export function useUpdateStockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: StockMutationVariables) =>
      updateProductStock(id, input),

    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.products.lists() });

      const snapshots = queryClient.getQueriesData<Product[]>({
        queryKey: queryKeys.products.lists(),
      });

      queryClient.setQueriesData<Product[]>(
        { queryKey: queryKeys.products.lists() },
        (old) =>
          old?.map((product) =>
            product.id === id ? { ...product, stock: input.stock } : product,
          ),
      );

      return { snapshots } satisfies StockMutationContext;
    },

    onError: (_error, _variables, context) => {
      context?.snapshots.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    },
  });
}
