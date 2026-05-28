"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createMaterial,
  deleteMaterial,
  updateMaterial,
} from "@/lib/inventory-api";
import { queryKeys } from "@/lib/query-keys";
import type {
  CreateMaterialInput,
  UpdateMaterialInput,
} from "@/lib/validators/material";

export function useCreateMaterialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMaterialInput) => createMaterial(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.all });
    },
  });
}

export function useUpdateMaterialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMaterialInput }) =>
      updateMaterial(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useDeleteMaterialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}
