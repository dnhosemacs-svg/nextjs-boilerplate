/**
 * Rutas seguras para redirecciones post-login (middleware, login/register, formulario).
 * Evita open redirects y bucles hacia /login o /register.
 */

export function isSafeInternalPath(value: string | null): value is string {
  return !!value && value.startsWith("/") && !value.startsWith("//");
}

const AUTH_ENTRY_PATHS = new Set(["/login", "/register"]);

function isValidPostLoginPath(value: string | null): value is string {
  return isSafeInternalPath(value) && !AUTH_ENTRY_PATHS.has(value);
}

type SearchParamsReader = Pick<URLSearchParams, "get">;

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
