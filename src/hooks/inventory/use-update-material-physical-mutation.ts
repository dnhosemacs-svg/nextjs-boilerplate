"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postMaterialMovement } from "@/lib/inventory-api";
import { queryKeys } from "@/lib/query-keys";

type UpdateMaterialPhysicalVariables = {
  materialId: string;
  previousPhysical: number;
  newPhysical: number;
};

export function useUpdateMaterialPhysicalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      materialId,
      previousPhysical,
      newPhysical,
    }: UpdateMaterialPhysicalVariables) => {
      const delta = newPhysical - previousPhysical;

      if (!Number.isFinite(delta) || delta === 0) {
        throw new Error("Sin cambios en el stock");
      }

      if (delta > 0) {
        return postMaterialMovement(materialId, { type: "IN", quantity: delta });
      }

      return postMaterialMovement(materialId, {
        type: "ADJUST",
        quantity: delta,
        reason: "Ajuste desde listado",
      });
    },

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
