"use client";

import { useSession } from "next-auth/react";
import { QueryErrorState } from "@/components/inventory/query-error-state";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useUpdateUserRoleMutation,
  useUsersQuery,
} from "@/hooks/users";
import { roleLabel } from "@/lib/role-labels";
import { ADMIN_CREATABLE_ROLES } from "@/lib/validators/user";
import type { AdminUser } from "@/types/admin-user";
import { UserRole } from "@/types/user-role";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-ES");
}

function UserRoleCell({ user }: { user: AdminUser }) {
  const { data: session } = useSession();
  const updateMutation = useUpdateUserRoleMutation();
  const isSelf = session?.user?.id === user.id;
  const isAdminUser = user.role === UserRole.ADMIN;

  if (isAdminUser || isSelf) {
    return (
      <Badge variant="secondary" title={isSelf ? "Tu cuenta" : undefined}>
        {roleLabel(user.role)}
      </Badge>
    );
  }

  return (
    <select
      value={user.role}
      disabled={updateMutation.isPending}
      onChange={(event) => {
        const role = event.target.value as (typeof ADMIN_CREATABLE_ROLES)[number];
        updateMutation.mutate({ id: user.id, input: { role } });
      }}
      className="h-8 min-w-[8rem] rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
      aria-label={`Rol de ${user.email}`}
    >
      {ADMIN_CREATABLE_ROLES.map((role) => (
        <option key={role} value={role}>
          {roleLabel(role)}
        </option>
      ))}
    </select>
  );
}

export function AdminUserList() {
  const { data = [], isLoading, isError, error, refetch } = useUsersQuery();
  const updateMutation = useUpdateUserRoleMutation();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando usuarios…</p>;
  }

  if (isError) {
    return (
      <QueryErrorState
        error={error}
        fallbackMessage="Error al cargar usuarios"
        onRetry={() => refetch()}
      />
    );
  }

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay usuarios registrados. Crea el primero arriba.
      </p>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Correo</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Alta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.name ?? "—"}</TableCell>
              <TableCell>
                <UserRoleCell user={user} />
              </TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {updateMutation.isError ? (
        <p className="mt-2 text-sm text-destructive">
          {updateMutation.error.message}
        </p>
      ) : null}
    </>
  );
}
