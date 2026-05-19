import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isProtectedApiPath } from "@/lib/protected-api-routes";
import { getPostLoginDestination } from "@/lib/safe-redirect";
import { getAuthSecret } from "@/lib/server-env";

const authSecret = getAuthSecret();

function hasValidToken(
  token: Awaited<ReturnType<typeof getToken>>,
): boolean {
  if (!token || typeof token !== "object") return false;
  return Boolean(
    ("sub" in token && token.sub) ||
      ("email" in token && token.email) ||
      ("id" in token && token.id),
  );
}

function isProtectedPage(pathname: string): boolean {
  if (pathname === "/stats") return true;
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return true;
  if (pathname === "/tasks" || pathname.startsWith("/tasks/")) return true;
  if (pathname === "/products" || pathname.startsWith("/products/")) return true;
  if (pathname === "/categories" || pathname.startsWith("/categories/")) return true;
  return false;
}

/**
 * APIs sensibles: 401 JSON si no hay sesión.
 */
async function handleProtectedApi(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtectedApiPath(pathname)) {
    return null;
  }

  const token = await getToken({ req: request, secret: authSecret });
  if (!hasValidToken(token)) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  return NextResponse.next();
}

/**
 * Páginas privadas: redirect a /login si no hay sesión.
 */
async function handleProtectedPage(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!isProtectedPage(pathname)) {
    return null;
  }

  const token = await getToken({ req: request, secret: authSecret });
  if (!hasValidToken(token)) {
    const signIn = new URL("/login", request.url);
    signIn.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(signIn);
  }

  return NextResponse.next();
}

/**
 * Login/register con sesión activa → destino post-login.
 */
async function handleAuthPages(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname !== "/login" && pathname !== "/register") {
    return null;
  }

  const token = await getToken({ req: request, secret: authSecret });
  if (!hasValidToken(token)) {
    return NextResponse.next();
  }

  const destination = getPostLoginDestination(request.nextUrl.searchParams);
  return NextResponse.redirect(new URL(destination, request.url));
}

export async function middleware(request: NextRequest) {
  const apiResult = await handleProtectedApi(request);
  if (apiResult) return apiResult;

  const pageResult = await handleProtectedPage(request);
  if (pageResult) return pageResult;

  const authPageResult = await handleAuthPages(request);
  if (authPageResult) return authPageResult;

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/tasks/:path*",
    "/stats",
    "/products",
    "/products/:path*",
    "/categories",
    "/categories/:path*",
    "/api/tasks/:path*",
    "/api/products/:path*",
    "/api/categories/:path*",
    "/login",
    "/register",
  ],
};
