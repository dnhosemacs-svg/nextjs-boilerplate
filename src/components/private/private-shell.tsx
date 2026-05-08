"use client";

import { useState } from "react";
import NewTaskFab from "./new-task-fab";
import PrivateHeader from "./private-header";
import PrivateSidebar from "./private-sidebar";

export default function PrivateShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="private-shell">
      <PrivateSidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="private-main">
        <PrivateHeader onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="private-content">{children}</main>
      </div>
      <NewTaskFab />
    </div>
  );
}
