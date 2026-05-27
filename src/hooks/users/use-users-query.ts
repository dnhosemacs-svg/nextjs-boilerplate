"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/lib/users-api";
import { queryKeys } from "@/lib/query-keys";

export function useUsersQuery() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: getUsers,
  });
}
