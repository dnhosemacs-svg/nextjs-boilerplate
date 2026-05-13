"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "next-auth/react";

type PrivateHeaderProps = {
  onOpenSidebar: () => void;
};

export default function PrivateHeader({ onOpenSidebar }: PrivateHeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function onLogout() {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: "/login" });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="private-header">
      <button type="button" onClick={onOpenSidebar} className="ui-pill ui-pill-secondary md:hidden">
        Menú
      </button>

      <div className="private-header-actions">
        <Link href="/stats" className="ui-pill ui-pill-secondary">
          Estadísticas
        </Link>
        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="ui-pill ui-pill-secondary"
        >
          {isLoggingOut ? "Saliendo..." : "Cerrar sesión"}
        </button>
      </div>
    </header>
  );
}
