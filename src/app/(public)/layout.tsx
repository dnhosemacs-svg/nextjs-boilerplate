import SiteNavbar from "@/components/site-navbar";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-full flex flex-col">
      <div className="w-full px-4 md:px-6">
        <div aria-hidden className="h-3" />
        <SiteNavbar />
      </div>
      {children}
    </div>
  );
}
