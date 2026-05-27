import { parseResponse } from "@/lib/http/parse-response";
import type { AdminUser } from "@/types/admin-user";
import type {
  CreateUserByAdminInput,
  UpdateUserRoleInput,
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

export async function updateUserRoleApi(
  id: string,
  input: UpdateUserRoleInput,
): Promise<AdminUser> {
  const response = await fetch(`/api/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<AdminUser>(response);
}
