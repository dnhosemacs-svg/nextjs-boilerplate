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

/** true si GitHub OAuth está listo para usarse (ambas variables definidas). */
export function isGithubOAuthConfigured(): boolean {
  const id = process.env.GITHUB_ID?.trim() ?? "";
  const secret = process.env.GITHUB_SECRET?.trim() ?? "";
  return id.length > 0 && secret.length > 0;
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

/** Cuenta de servicio Firebase Admin (crear usuarios desde el servidor). */
export function isFirebaseAdminConfigured(): boolean {
  const projectId = getFirebaseProjectId();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim() ?? "";
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim() ?? "";
  return (
    projectId.length > 0 && clientEmail.length > 0 && privateKey.length > 0
  );
}

export function getFirebaseProjectId(): string {
  return (
    process.env.FIREBASE_PROJECT_ID?.trim() ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ??
    ""
  );
}

/** Credencial para `firebase-admin` (solo servidor). */
export function getFirebaseAdminCredential(): {
  projectId: string;
  clientEmail: string;
  privateKey: string;
} {
  const projectId = getFirebaseProjectId();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim() ?? "";
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY ?? "")
    .replace(/\\n/g, "\n")
    .trim();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "[env] Firebase Admin incompleto: define FIREBASE_PROJECT_ID (o NEXT_PUBLIC_FIREBASE_PROJECT_ID), " +
        "FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY.",
    );
  }

  return { projectId, clientEmail, privateKey };
}

/**
 * Registro público en /register (Firebase en cliente).
 * `PUBLIC_REGISTRATION_ENABLED=false` → solo admin podrá dar de alta usuarios (pasos posteriores).
 */
export function isPublicRegistrationEnabled(): boolean {
  const raw = process.env.PUBLIC_REGISTRATION_ENABLED?.trim().toLowerCase();
  return raw !== "false";
}

/** Comprueba variables críticas antes de build o arranque en producción. */
export function assertServerEnv(): void {
  assertGithubPair();
  if (!isProduction()) return;

  getAuthSecret();
  assertCanonicalAppUrl();
  assertFirebaseApiKey();
}
