import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { CREDENTIALS_SIGN_IN_ERROR_CODES } from "@/lib/credentials-sign-in-errors";
import { signInWithPassword } from "@/lib/firebase-auth-rest";
import { getUserRoleById, upsertUserFromAuth } from "@/lib/users";
import { getAuthSecret } from "@/lib/server-env";
import { UserRole } from "@/types/user-role";

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
    async signIn({ user, account }) {
      if (account?.provider === "github" && user.id && user.email) {
        await upsertUserFromAuth({
          id: user.id,
          email: user.email,
          name: user.name ?? null,
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        if (user.role) {
          token.role = user.role;
        } else {
          const role = await getUserRoleById(user.id);
          token.role = role ?? UserRole.CLIENT;
        }
      } else if (token.sub && !token.role) {
        const role = await getUserRoleById(token.sub);
        if (role) {
          token.role = role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.email = token.email ?? session.user.email;
        session.user.name = token.name ?? session.user.name;
        session.user.role = token.role ?? UserRole.CLIENT;
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
        email: { label: "Correo electrónico", type: "email" },
        password: { label: "Contraseña", type: "password" },
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
        const dbUser = await upsertUserFromAuth({
          id: user.localId,
          email: user.email,
          name: user.displayName ?? user.email.split("@")[0] ?? user.email,
        });

        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name ?? undefined,
          role: dbUser.role,
        };
      },
    }),
  ],
} satisfies NextAuthOptions;
