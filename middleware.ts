import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { withAuth, type NextRequestWithAuth } from "next-auth/middleware";
import { getPostLoginDestination } from "@/lib/safe-redirect";
import { getAuthSecret } from "@/lib/server-env";

const authSecret = getAuthSecret();

/**
 * APIs de tareas: 401 JSON si no hay sesión.
 * `withAuth` redirige a /login (HTML); no sirve para rutas /api/*.
 */
async function handleProtectedApi(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/api/tasks")) {
    return null;
  }

  const token = await getToken({ req: request, secret: authSecret });
  if (!token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  return NextResponse.next();
}

const pageAuth = withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    if (
      (pathname === "/login" || pathname === "/register") &&
      req.nextauth.token
    ) {
      const destination = getPostLoginDestination(req.nextUrl.searchParams);
      return NextResponse.redirect(new URL(destination, req.url));
    }
  },
  {
    secret: authSecret,
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        if (pathname === "/login" || pathname === "/register") {
          return true;
        }

        return !!token;
      },
    },
  },
);

export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  const apiResult = await handleProtectedApi(request);
  if (apiResult) return apiResult;

  return pageAuth(request as NextRequestWithAuth, event);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tasks/:path*",
    "/stats",
    "/api/tasks/:path*",
    "/login",
    "/register",
  ],
};
