"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

type HomeAuthCtaProps = {
  className?: string;
};

const defaultClassName = "ui-pill ui-pill-primary";

export default function HomeAuthCta({ className = defaultClassName }: HomeAuthCtaProps) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session?.user;

  if (status === "loading") {
    return (
      <span className={`${className} pointer-events-none opacity-60`} aria-hidden>
        …
      </span>
    );
  }

  if (isAuthenticated) {
    return (
      <Link href="/dashboard" className={className}>
        Ir al panel
      </Link>
    );
  }

  return (
    <Link href="/login" className={className}>
      Iniciar sesión
    </Link>
  );
}
