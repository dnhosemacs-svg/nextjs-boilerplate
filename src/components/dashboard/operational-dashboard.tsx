"use client";

import Link from "next/link";
import { ClientDashboard } from "@/components/dashboard/client-dashboard";
import { LowStockWidget } from "@/components/dashboard/low-stock-widget";
import { ShortagesWidget } from "@/components/dashboard/shortages-widget";
import { canManageUsers, canViewOperationalWidgets } from "@/lib/permissions";
import type { UserRole } from "@/types/user-role";
import { UserRole as R } from "@/types/user-role";

type OperationalDashboardProps = {
  role: UserRole;
};

export function OperationalDashboard({ role }: OperationalDashboardProps) {
  const showOps = canViewOperationalWidgets(role);

  return (
    <>
      <header className="dashboard-hero">
        <div className="flex flex-col gap-3">
          <h1 className="section-heading">
            {role === R.CLIENT ? "Mi panel" : "Panel del taller"}
          </h1>
          <p className="content-description">
            {role === R.CLIENT
              ? "Estado de tus pedidos y accesos rápidos."
              : "Prioriza faltantes, stock bajo y seguimiento operativo."}
          </p>
          {canManageUsers(role) ? (
            <Link href="/admin/users" className="ui-link-underline text-sm w-fit">
              Gestionar usuarios
            </Link>
          ) : null}
        </div>
      </header>

      {showOps ? (
        <div className="dashboard-widgets-grid space-y-6">
          <ShortagesWidget />
          <LowStockWidget />
        </div>
      ) : (
        <ClientDashboard />
      )}
    </>
  );
}
