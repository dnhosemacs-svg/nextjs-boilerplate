import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { getServerSession } from "next-auth";
import Providers from "@/components/providers";
import { authOptions } from "@/lib/auth";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["600"],
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
  const session = await getServerSession(authOptions);

  return (
    <html
      lang="es"
      className={`${manrope.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}