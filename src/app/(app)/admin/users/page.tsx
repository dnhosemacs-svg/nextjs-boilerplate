import { AdminUsersPanel } from "@/components/admin/admin-users-panel";

export default function AdminUsersPage() {
  return (
    <main className="page-shell dashboard-shell">
      <header className="dashboard-hero mb-8">
        <p className="eyebrow">Administración</p>
        <h1 className="section-heading">Usuarios</h1>
        <p className="content-description">
          Gestiona cuentas del taller: crea operarios o clientes y asigna roles.
        </p>
      </header>
      <AdminUsersPanel />
    </main>
  );
}
