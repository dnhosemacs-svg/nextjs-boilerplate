import PrivateShell from "@/components/private/private-shell";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <PrivateShell>{children}</PrivateShell>;
}
