import { cookies } from "next/headers";
import SiteNavbar from "@/components/site-navbar";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get(AUTH_COOKIE_NAME)?.value === "1";

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
