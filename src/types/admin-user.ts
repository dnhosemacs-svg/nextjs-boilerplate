import type { UserRole } from "@/types/user-role";

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
};
