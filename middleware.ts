import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = await getToken({ req: request });
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
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname === "/login" && isLoggedIn) {
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
