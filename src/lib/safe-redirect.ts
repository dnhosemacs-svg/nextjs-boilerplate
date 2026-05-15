/**
 * Evita open redirects: solo rutas internas relativas (p. ej. /dashboard, /tasks/1?q=1).
 */
export function isSafeInternalPath(value: string | null): value is string {
  return !!value && value.startsWith("/") && !value.startsWith("//");
}

/** Destinos que no deben usarse tras login (evitan bucles con middleware/páginas de auth). */
const AUTH_ENTRY_PATHS = new Set(["/login", "/register"]);

function isValidPostLoginPath(value: string | null): value is string {
  return isSafeInternalPath(value) && !AUTH_ENTRY_PATHS.has(value);
}

type SearchParamsReader = Pick<URLSearchParams, "get">;

/**
 * Ruta de login con `callbackUrl` (estándar Auth.js / withAuth).
 */
export function buildLoginRedirectPath(returnPath: string): string {
  if (!isSafeInternalPath(returnPath)) {
    return "/login";
  }
  const params = new URLSearchParams({ callbackUrl: returnPath });
  return `/login?${params.toString()}`;
}

/**
 * Destino tras login. Auth.js y withAuth usan `callbackUrl`.
 * Se mantiene lectura de `next` solo por enlaces antiguos guardados.
 */
export function getPostLoginDestination(
  searchParams: SearchParamsReader,
  fallback = "/dashboard",
): string {
  const callbackUrl = searchParams.get("callbackUrl");
  if (isValidPostLoginPath(callbackUrl)) return callbackUrl;

  const next = searchParams.get("next");
  if (isValidPostLoginPath(next)) return next;

  return fallback;
}

/**
 * Escribe `callbackUrl` en una URL de /login ya construida.
 */
export function applyLoginReturnParams(loginUrl: URL, returnPath: string): void {
  if (!isSafeInternalPath(returnPath)) return;
  loginUrl.searchParams.set("callbackUrl", returnPath);
}
