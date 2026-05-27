"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser, updateUserRoleApi } from "@/lib/users-api";
import { queryKeys } from "@/lib/query-keys";
import type {
  CreateUserByAdminInput,
  UpdateUserRoleInput,
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

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserRoleInput }) =>
      updateUserRoleApi(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
