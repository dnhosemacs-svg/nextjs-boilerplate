import { getServerSession } from "next-auth";
import { OrderStatsView } from "@/components/dashboard/order-stats-view";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@/types/user-role";

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role ?? UserRole.CLIENT;

  return (
    <main className="page-shell max-w-4xl items-start">
      <OrderStatsView role={role} />
    </main>
  );
}
