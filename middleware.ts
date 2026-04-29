import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

/**
 * Middleware de autenticacion basico:
 * - Protege /tasks/* para usuarios autenticados.
 * - Evita entrar a /login si ya hay sesion.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAuthenticated = request.cookies.get(AUTH_COOKIE_NAME)?.value === "1";

  if (pathname.startsWith("/tasks") && !isAuthenticated) {
    const redirectUrl = new URL("/login", request.url);
    const nextPath = `${pathname}${search}`;
    redirectUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tasks/:path*", "/login"],
};
