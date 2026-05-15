import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  applyLoginReturnParams,
  getPostLoginDestination,
} from "@/lib/safe-redirect";
import { getAuthSecret } from "@/lib/server-env";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: getAuthSecret(),
  });
  const isLoggedIn = !!token;

  const isProtectedPage =
    pathname === "/dashboard" ||
    pathname === "/stats" ||
    pathname.startsWith("/tasks");
  const isProtectedApi = pathname.startsWith("/api/tasks");

  if (isProtectedApi && !isLoggedIn) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (isProtectedPage && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    applyLoginReturnParams(loginUrl, `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === "/login" || pathname === "/register") && isLoggedIn) {
    const destination = getPostLoginDestination(request.nextUrl.searchParams);
    return NextResponse.redirect(new URL(destination, request.url));
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
    "/register",
  ],
};
