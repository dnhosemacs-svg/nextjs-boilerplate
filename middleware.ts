import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

const PROTECTED_PAGE_PREFIXES = ["/tasks", "/stats"];
const PROTECTED_API_PREFIXES = ["/api/tasks"];

function isProtectedPage(pathname: string) {
  return PROTECTED_PAGE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isProtectedApi(pathname: string) {
  return PROTECTED_API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAuthenticated = request.cookies.get(AUTH_COOKIE_NAME)?.value === "1";

  // API protegida => responde 401 JSON (no redirect HTML)
  if (isProtectedApi(pathname) && !isAuthenticated) {
    return NextResponse.json(
      { error: "No autenticado" },
      { status: 401 },
    );
  }

  // Paginas protegidas => redirect a login con next
  if (isProtectedPage(pathname) && !isAuthenticated) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  // Si ya hay sesion, evitar /login
  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tasks/:path*", "/stats/:path*", "/api/tasks/:path*", "/login"],
};
