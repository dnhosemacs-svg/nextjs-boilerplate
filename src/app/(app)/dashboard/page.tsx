import { getServerSession } from "next-auth";
import { ClientDashboard } from "@/components/dashboard/client-dashboard";
import { WorkshopDashboard } from "@/components/dashboard/workshop-dashboard";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@/types/user-role";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role ?? UserRole.CLIENT;

  return (
    <main className="page-shell dashboard-shell">
      {role === UserRole.CLIENT ? (
        <ClientDashboard />
      ) : (
        <WorkshopDashboard role={role} />
      )}
    </main>
  );
}
