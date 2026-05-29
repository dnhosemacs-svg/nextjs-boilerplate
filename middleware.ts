import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isProtectedApiPath } from "@/lib/protected-api-routes";
import {
  canAccessAdminPage,
  canAccessWarehousePage,
  getTokenRole,
  isAdminPage,
  isWarehousePage,
} from "@/lib/route-access";
import { getPostLoginDestination } from "@/lib/safe-redirect";
import { getAuthSecret, isPublicRegistrationEnabled } from "@/lib/server-env";

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
  if (pathname === "/orders" || pathname.startsWith("/orders/")) return true;
  if (pathname === "/products" || pathname.startsWith("/products/")) return true;
  if (pathname === "/categories" || pathname.startsWith("/categories/")) return true;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;
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

  const isInventoryApi =
    pathname.startsWith("/api/products") ||
    pathname.startsWith("/api/categories") ||
    pathname.startsWith("/api/materials");
  if (isInventoryApi) {
    const role = getTokenRole(token);
    if (!canAccessWarehousePage(role)) {
      return NextResponse.json({ error: "Prohibido" }, { status: 403 });
    }
  }

  if (pathname.startsWith("/api/users")) {
    const role = getTokenRole(token);
    if (!canAccessAdminPage(role)) {
      return NextResponse.json({ error: "Prohibido" }, { status: 403 });
    }
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

  const role = getTokenRole(token);
  if (isAdminPage(pathname) && !canAccessAdminPage(role)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (isWarehousePage(pathname) && !canAccessWarehousePage(role)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

/**
 * /register desactivado por env → login.
 */
function handleRegisterDisabled(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname !== "/register" || isPublicRegistrationEnabled()) {
    return null;
  }
  return NextResponse.redirect(new URL("/login", request.url));
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
  const registerDisabled = handleRegisterDisabled(request);
  if (registerDisabled) return registerDisabled;

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
    "/orders",
    "/orders/:path*",
    "/stats",
    "/products",
    "/products/:path*",
    "/categories",
    "/categories/:path*",
    "/admin",
    "/admin/:path*",
    "/api/products/:path*",
    "/api/categories/:path*",
    "/api/materials/:path*",
    "/api/orders",
    "/api/orders/:path*",
    "/api/users",
    "/api/users/:path*",
    "/login",
    "/register",
  ],
};
