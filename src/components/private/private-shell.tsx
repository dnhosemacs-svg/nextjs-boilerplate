"use client";

import PrivateHeader from "./private-header";
import PrivateSidebar from "./private-sidebar";
import { useUiStore } from "@/stores/ui-store";
import type { UserRole } from "@/types/user-role";

export default function PrivateShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: UserRole;
}) {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  return (
    <div className="private-shell">
      <PrivateSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role={role}
      />
      <div className="private-main">
        <PrivateHeader onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="private-content">{children}</main>
      </div>
    </div>
  );
}
