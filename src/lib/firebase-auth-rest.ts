import { logServerError, logServerWarning } from "@/lib/observability";
import { getFirebaseApiKey } from "@/lib/server-env";

const FIREBASE_SIGN_IN_URL =
  "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword";

export type FirebaseSignInUser = {
  localId: string;
  email: string;
  displayName?: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
};

export type FirebaseSignInFailureReason =
  | "invalid_credentials"
  | "network"
  | "config"
  | "unknown";

export type FirebaseSignInResult =
  | { ok: true; user: FirebaseSignInUser }
  | { ok: false; reason: FirebaseSignInFailureReason };

function parseFirebaseErrorMessage(body: unknown): string | undefined {
  if (!body || typeof body !== "object" || !("error" in body)) return undefined;
  const error = (body as { error?: unknown }).error;
  if (!error || typeof error !== "object" || !("message" in error)) return undefined;
  const message = (error as { message?: unknown }).message;
  return typeof message === "string" ? message : undefined;
}

function parseFirebaseSuccess(body: unknown): FirebaseSignInUser | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const localId = record.localId;
  const email = record.email;
  const idToken = record.idToken;
  const refreshToken = record.refreshToken;
  const expiresIn = record.expiresIn;

  if (
    typeof localId !== "string" ||
    typeof email !== "string" ||
    typeof idToken !== "string" ||
    typeof refreshToken !== "string" ||
    typeof expiresIn !== "string"
  ) {
    return null;
  }

  const displayName =
    typeof record.displayName === "string" ? record.displayName : undefined;

  return {
    localId,
    email,
    displayName,
    idToken,
    refreshToken,
    expiresIn,
  };
}

/**
 * Inicia sesión con email/contraseña vía Identity Toolkit REST.
 * Los detalles de Firebase solo se registran en servidor; no se exponen al cliente.
 */
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<FirebaseSignInResult> {
  const apiKey = getFirebaseApiKey();
  if (!apiKey) {
    logServerError(new Error("FIREBASE_API_KEY no configurada"), {
      module: "firebase-auth",
    });
    return { ok: false, reason: "config" };
  }

  const url = `${FIREBASE_SIGN_IN_URL}?key=${encodeURIComponent(apiKey)}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });

    const body: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const firebaseCode = parseFirebaseErrorMessage(body);
      logServerWarning("[firebase-auth] signIn failed", {
        status: response.status,
        code: firebaseCode ?? "unknown",
      });
      return { ok: false, reason: "invalid_credentials" };
    }

    const user = parseFirebaseSuccess(body);
    if (!user) {
      logServerError(
        new Error("Respuesta Firebase sin campos obligatorios"),
        { module: "firebase-auth" },
      );
      return { ok: false, reason: "unknown" };
    }

    return { ok: true, user };
  } catch (error) {
    logServerError(error, {
      module: "firebase-auth",
      phase: "network",
    });
    return { ok: false, reason: "network" };
  }
}
