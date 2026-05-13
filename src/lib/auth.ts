import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase() ?? "";
        const password = credentials?.password?.trim() ?? "";

        // TODO: reemplazar con validación contra base de datos
        if (email === "admin@carpinteria.local" && password === "123456") {
          return { id: "1", email, name: "Admin" };
        }

        return null;
      },
    }),
  ],
} satisfies NextAuthOptions;
