"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOrder,
  setOrderMaterialLines,
  transitionOrderStatus,
  updateOrder,
} from "@/lib/orders-api";
import { queryKeys } from "@/lib/query-keys";
import type {
  CreateOrderPayload,
  SetOrderMaterialLinesPayload,
  UpdateOrderPayload,
} from "@/types/order";
import type { OrderStatus } from "@/types/order-status";

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

export function useSetOrderMaterialLinesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: SetOrderMaterialLinesPayload;
    }) => setOrderMaterialLines(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.id) });
    },
  });
}

export function useTransitionOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      transitionOrderStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.id) });
    },
  });
}
