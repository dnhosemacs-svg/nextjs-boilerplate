import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "taskflow_auth";

/**
 * Middleware de autenticacion mock:
 * - Si no existe la cookie taskflow_auth=1, redirige al inicio.
 * - Si existe, permite continuar al recurso solicitado.
 */
export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get(AUTH_COOKIE_NAME)?.value === "1";

  if (!isAuthenticated) {
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("auth", "required");
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tasks/:path*"],
};
