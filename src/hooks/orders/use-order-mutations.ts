"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder, updateOrder } from "@/lib/orders-api";
import { queryKeys } from "@/lib/query-keys";
import type { CreateOrderPayload, UpdateOrderPayload } from "@/types/order";

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrderPayload) => createOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}

export function useUpdateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOrderPayload }) =>
      updateOrder(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.id) });
    },
  });
}
