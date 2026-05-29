/**
 * Prefijos de API que exigen sesión (middleware 401 + comprobación en handlers).
 * Al añadir una ruta nueva sensible, inclúyela aquí y en el matcher de middleware.ts.
 */
export const PROTECTED_API_PREFIXES = [
  "/api/products",
  "/api/categories",
  "/api/materials",
  "/api/orders",
  "/api/users",
] as const;

export function isProtectedApiPath(pathname: string): boolean {
  return PROTECTED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
