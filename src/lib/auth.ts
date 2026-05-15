import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { CREDENTIALS_SIGN_IN_ERROR_CODES } from "@/lib/credentials-sign-in-errors";
import { signInWithPassword } from "@/lib/firebase-auth-rest";
import { getAuthSecret } from "@/lib/server-env";

export const authOptions = {
  secret: getAuthSecret(),
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.email = token.email ?? session.user.email;
        session.user.name = token.name ?? session.user.name;
      }
      return session;
    },
  },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase() ?? "";
        const password = credentials?.password?.trim() ?? "";

        if (!email || !password) {
          return null;
        }

        const result = await signInWithPassword(email, password);

        if (!result.ok) {
          if (result.reason === "config") {
            console.error(
              "[auth] CredentialsProvider: revisa FIREBASE_API_KEY en el entorno",
            );
            throw new Error(CREDENTIALS_SIGN_IN_ERROR_CODES.CONFIG_ERROR);
          }
          if (result.reason === "network") {
            throw new Error(CREDENTIALS_SIGN_IN_ERROR_CODES.NETWORK_ERROR);
          }
          if (result.reason === "invalid_credentials") {
            throw new Error(CREDENTIALS_SIGN_IN_ERROR_CODES.INVALID_CREDENTIALS);
          }
          throw new Error(CREDENTIALS_SIGN_IN_ERROR_CODES.UNKNOWN_ERROR);
        }

        const { user } = result;
        return {
          id: user.localId,
          email: user.email,
          name: user.displayName ?? user.email.split("@")[0] ?? user.email,
        };
      },
    }),
  ],
} satisfies NextAuthOptions;
