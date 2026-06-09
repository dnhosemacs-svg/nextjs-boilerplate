"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postMaterialMovement } from "@/lib/inventory-api";
import { queryKeys } from "@/lib/query-keys";

type RecordStockInVariables = {
  materialId: string;
  quantity: number;
};

export function useRecordStockInMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ materialId, quantity }: RecordStockInVariables) =>
      postMaterialMovement(materialId, { type: "IN", quantity }),

    onSuccess: (result, { materialId }) => {
      queryClient.setQueryData(
        [...queryKeys.materials.all, "stock", materialId],
        result.stock,
      );
    },

    onSettled: (_data, _error, variables) => {
      if (!variables) return;

      const { materialId } = variables;
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.materials.all, "stock", materialId],
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.lists() });
      queryClient.invalidateQueries({
        queryKey: ["materials", "movements", materialId],
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.lowStock() });
    },
  });
}
