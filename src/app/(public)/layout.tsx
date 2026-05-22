import SiteNavbar from "@/components/site-navbar";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-full flex flex-col">
      <div className="site-header-wrap w-full px-4 md:px-6">
        <SiteNavbar />
      </div>
      {children}
    </div>
  );
}
