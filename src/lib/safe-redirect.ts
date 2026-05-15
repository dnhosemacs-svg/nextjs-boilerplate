/**
 * Evita open redirects: solo rutas internas relativas (p. ej. /dashboard, /tasks/1?q=1).
 */
export function isSafeInternalPath(value: string | null): value is string {
  return !!value && value.startsWith("/") && !value.startsWith("//");
}

type SearchParamsReader = Pick<URLSearchParams, "get">;

/**
 * Destino tras login. Auth.js usa `callbackUrl`; el middleware del proyecto usa `next`.
 * Prioridad: callbackUrl → next → fallback.
 */
export function getPostLoginDestination(
  searchParams: SearchParamsReader,
  fallback = "/dashboard",
): string {
  const callbackUrl = searchParams.get("callbackUrl");
  if (isSafeInternalPath(callbackUrl)) return callbackUrl;

  const next = searchParams.get("next");
  if (isSafeInternalPath(next)) return next;

  return fallback;
}

/**
 * Guarda la ruta a la que volver tras login en la URL de /login.
 * Escribe `callbackUrl` (Auth.js) y `next` (middleware histórico del proyecto).
 */
export function applyLoginReturnParams(loginUrl: URL, returnPath: string): void {
  if (!isSafeInternalPath(returnPath)) return;
  loginUrl.searchParams.set("next", returnPath);
  loginUrl.searchParams.set("callbackUrl", returnPath);
}
