"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { QueryErrorState } from "@/components/inventory/query-error-state";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUpdateUserMutation, useUsersQuery } from "@/hooks/users";
import { roleLabel } from "@/lib/role-labels";
import { ADMIN_CREATABLE_ROLES } from "@/lib/validators/user";
import type { AdminUser } from "@/types/admin-user";
import { UserRole } from "@/types/user-role";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-ES");
}

function UserNameCell({ user }: { user: AdminUser }) {
  const { data: session, update: updateSession } = useSession();
  const updateMutation = useUpdateUserMutation();
  const [value, setValue] = useState(user.name ?? "");

  const nameKey = user.name ?? "";
  const [prevNameKey, setPrevNameKey] = useState(nameKey);

  if (nameKey !== prevNameKey) {
    setPrevNameKey(nameKey);
    setValue(nameKey);
  }

  function save() {
    const trimmed = value.trim();
    const next = trimmed === "" ? null : trimmed;
    const current = user.name?.trim() || null;
    if (next === current) return;
    updateMutation.mutate(
      { id: user.id, input: { name: trimmed } },
      {
        onSuccess: () => {
          if (session?.user?.id === user.id) {
            void updateSession();
          }
        },
      },
    );
  }

  return (
    <input
      type="text"
      value={value}
      disabled={updateMutation.isPending}
      onChange={(event) => setValue(event.target.value)}
      onBlur={save}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
      }}
      placeholder="Sin nombre"
      className="h-8 w-full min-w-[8rem] max-w-[14rem] rounded-lg border border-input bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
      aria-label={`Nombre de ${user.email}`}
    />
  );
}

function UserRoleCell({ user }: { user: AdminUser }) {
  const { data: session } = useSession();
  const updateMutation = useUpdateUserMutation();
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
    <Select
      value={user.role}
      disabled={updateMutation.isPending}
      onValueChange={(value) => {
        const role = value as (typeof ADMIN_CREATABLE_ROLES)[number];
        updateMutation.mutate({ id: user.id, input: { role } });
      }}
    >
      <SelectTrigger className="h-8 min-w-[8rem]" aria-label={`Rol de ${user.email}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ADMIN_CREATABLE_ROLES.map((role) => (
          <SelectItem key={role} value={role}>
            {roleLabel(role)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AdminUserList() {
  const { data = [], isLoading, isError, error, refetch } = useUsersQuery();
  const updateMutation = useUpdateUserMutation();

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
      <div className="workshop-table-wrap">
        <Table className="workshop-table">
          <TableHeader>
            <TableRow>
              <TableHead>Correo</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="workshop-table-head-edge">Alta</TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {data.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <UserNameCell user={user} />
              </TableCell>
              <TableCell>
                <UserRoleCell user={user} />
              </TableCell>
              <TableCell className="workshop-table-cell-edge">
                {formatDate(user.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>
      </div>

      {updateMutation.isError ? (
        <p className="mt-2 text-sm text-destructive">
          {updateMutation.error.message}
        </p>
      ) : null}
    </>
  );
}
