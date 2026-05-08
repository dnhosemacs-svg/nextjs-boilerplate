"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type PrivateHeaderProps = {
  onOpenSidebar: () => void;
};

export default function PrivateHeader({ onOpenSidebar }: PrivateHeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function onLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
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
