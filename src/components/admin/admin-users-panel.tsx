"use client";

import { AdminUserCreateForm } from "./admin-user-create-form";
import { AdminUserList } from "./admin-user-list";

export function AdminUsersPanel() {
  return (
    <div className="flex flex-col gap-8">
      <section className="surface-card flex flex-col gap-4 p-6">
        <div>
          <h2 className="section-heading text-2xl">Nuevo usuario</h2>
          <p className="text-sm text-[var(--muted)]">
            Crea operarios o clientes. Solo un administrador puede dar de alta
            cuentas.
          </p>
        </div>
        <AdminUserCreateForm />
      </section>

      <section className="surface-card flex flex-col gap-4 p-6">
        <div>
          <h2 className="section-heading text-2xl">Usuarios</h2>
          <p className="text-sm text-[var(--muted)]">
            Cambia el rol de operario o cliente. El usuario afectado deberá
            volver a iniciar sesión para ver los permisos actualizados.
          </p>
        </div>
        <AdminUserList />
      </section>
    </div>
  );
}
