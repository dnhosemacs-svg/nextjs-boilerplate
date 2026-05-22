"use client";

import PrivateHeader from "./private-header";
import PrivateSidebar from "./private-sidebar";
import { useUiStore } from "@/stores/ui-store";

export default function PrivateShell({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  return (
    <div className="private-shell">
      <PrivateSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="private-main">
        <PrivateHeader onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="private-content">{children}</main>
      </div>
    </div>
  );
}
