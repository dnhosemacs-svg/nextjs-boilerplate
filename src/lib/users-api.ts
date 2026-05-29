import { parseResponse } from "@/lib/http/parse-response";
import type { SyncFirebaseUsersResult } from "@/lib/sync-firebase-users";
import type { AdminUser } from "@/types/admin-user";
import type {
  CreateUserByAdminInput,
  UpdateUserByAdminInput,
} from "@/lib/validators/user";

export async function getUsers(): Promise<AdminUser[]> {
  const response = await fetch("/api/users", {
    method: "GET",
    cache: "no-store",
  });
  return parseResponse<AdminUser[]>(response);
}

export async function createUser(
  input: CreateUserByAdminInput,
): Promise<AdminUser> {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<AdminUser>(response);
}

export async function updateUserByAdminApi(
  id: string,
  input: UpdateUserByAdminInput,
): Promise<AdminUser> {
  const response = await fetch(`/api/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<AdminUser>(response);
}

export async function syncFirebaseUsers(): Promise<SyncFirebaseUsersResult> {
  const response = await fetch("/api/users/sync", { method: "POST" });
  return parseResponse<SyncFirebaseUsersResult>(response);
}
