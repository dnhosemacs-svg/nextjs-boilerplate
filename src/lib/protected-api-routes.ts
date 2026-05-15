/**
 * Prefijos de API que exigen sesión (middleware 401 + comprobación en handlers).
 * Al añadir una ruta nueva sensible, inclúyela aquí y en el matcher de middleware.ts.
 */
export const PROTECTED_API_PREFIXES = ["/api/tasks"] as const;

export function isProtectedApiPath(pathname: string): boolean {
  return PROTECTED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
