/**
 * Validación de variables de entorno del servidor.
 * Se importa desde `next.config.ts` para fallar en `next build` si falta algo crítico en producción.
 */

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

let warnedDevSecret = false;

/** Secreto para firmar JWT de NextAuth. En producción no hay valor por defecto. */
export function getAuthSecret(): string {
  const secret =
    (process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? "").trim();
  if (secret.length > 0) return secret;

  if (isProduction()) {
    throw new Error(
      "[env] Falta NEXTAUTH_SECRET o AUTH_SECRET en producción. " +
        "Genera un valor seguro, por ejemplo: openssl rand -base64 32",
    );
  }

  if (!warnedDevSecret) {
    console.warn(
      "[env] NEXTAUTH_SECRET no definido: usando secreto solo para desarrollo.",
    );
    warnedDevSecret = true;
  }
  return "dev-only-secret-change-in-production";
}

function assertCanonicalAppUrl(): void {
  const hasUrl =
    Boolean(process.env.NEXTAUTH_URL?.trim()) ||
    Boolean(process.env.VERCEL_URL?.trim()) ||
    Boolean(process.env.NEXT_PUBLIC_APP_URL?.trim());

  if (!hasUrl) {
    throw new Error(
      "[env] En producción hace falta al menos una URL canónica: " +
        "NEXTAUTH_URL (recomendado), o VERCEL_URL en Vercel, o NEXT_PUBLIC_APP_URL.",
    );
  }
}

function assertGithubPair(): void {
  const id = process.env.GITHUB_ID?.trim() ?? "";
  const secret = process.env.GITHUB_SECRET?.trim() ?? "";
  if (Boolean(id) !== Boolean(secret)) {
    throw new Error(
      "[env] GITHUB_ID y GITHUB_SECRET deben estar ambos definidos o ambos vacíos.",
    );
  }
}

/** Clave web de Firebase (REST signInWithPassword). Solo servidor. */
export function getFirebaseApiKey(): string {
  return process.env.FIREBASE_API_KEY?.trim() ?? "";
}

function assertFirebaseApiKey(): void {
  if (getFirebaseApiKey().length > 0) return;

  throw new Error(
    "[env] Falta FIREBASE_API_KEY en producción (login email/contraseña vía Firebase REST).",
  );
}

/** Comprueba variables críticas antes de build o arranque en producción. */
export function assertServerEnv(): void {
  assertGithubPair();
  if (!isProduction()) return;

  getAuthSecret();
  assertCanonicalAppUrl();
  assertFirebaseApiKey();
}
