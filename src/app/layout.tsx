import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Cormorant_Garamond, Geist_Mono, Manrope } from "next/font/google";
import "./globals.css";
import SiteNavbar from "@/components/site-navbar";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Carpintería | Panel del taller",
  description:
    "Herramienta interna para registrar y administrar pedidos del taller (equipo).",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get(AUTH_COOKIE_NAME)?.value === "1";

  return (
    <html
      lang="es"
      className={`${manrope.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="w-full">
          <div className="w-full px-4 md:px-6">
            <SiteNavbar isAuthenticated={isAuthenticated} />
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}