import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAuthenticated = request.cookies.get(AUTH_COOKIE_NAME)?.value === "1";

  const isProtectedPage =
    pathname === "/dashboard" ||
    pathname === "/stats" ||
    pathname.startsWith("/tasks");
  const isProtectedApi = pathname.startsWith("/api/tasks");

  if (isProtectedApi && !isAuthenticated) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (isProtectedPage && !isAuthenticated) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tasks/:path*",
    "/stats/:path*",
    "/api/tasks/:path*",
    "/login",
  ],
};
