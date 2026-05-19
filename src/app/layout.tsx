import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope, Geist } from "next/font/google";
import { getServerSession } from "next-auth";
import Providers from "@/components/providers";
import { authOptions } from "@/lib/auth";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
      className={cn("h-full antialiased", manrope.variable, cormorant.variable, geist.variable)}
    >
      <body className="min-h-full">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}