import SiteNavbar from "@/components/site-navbar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session?.user;

  return (
    <div className="min-h-full flex flex-col">
      <div className="w-full px-4 md:px-6">
        <div aria-hidden className="h-3" />
        <SiteNavbar isAuthenticated={isAuthenticated} />
      </div>
      {children}
    </div>
  );
}
