"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createUser,
  syncFirebaseUsers,
  updateUserByAdminApi,
} from "@/lib/users-api";
import { queryKeys } from "@/lib/query-keys";
import type {
  CreateUserByAdminInput,
  UpdateUserByAdminInput,
} from "@/lib/validators/user";

export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserByAdminInput) => createUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserByAdminInput }) =>
      updateUserByAdminApi(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

/** @deprecated Usa useUpdateUserMutation */
export const useUpdateUserRoleMutation = useUpdateUserMutation;

export function useSyncFirebaseUsersMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => syncFirebaseUsers(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
