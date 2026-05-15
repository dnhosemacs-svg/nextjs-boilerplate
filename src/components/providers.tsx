"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

type ProvidersProps = {
  children: React.ReactNode;
  session?: Session | null;
};

export default function Providers({ children, session }: ProvidersProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
