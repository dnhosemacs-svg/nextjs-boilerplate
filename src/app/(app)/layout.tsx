import { unstable_noStore as noStore } from "next/cache";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PrivateShell from "@/components/private/private-shell";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  noStore();
  const cookieStore = await cookies();
  const hasSessionCookie = Boolean(
    cookieStore.get("next-auth.session-token")?.value ||
      cookieStore.get("__Secure-next-auth.session-token")?.value,
  );

  if (!hasSessionCookie) {
    redirect("/login");
  }

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return <PrivateShell role={session.user.role}>{children}</PrivateShell>;
}
