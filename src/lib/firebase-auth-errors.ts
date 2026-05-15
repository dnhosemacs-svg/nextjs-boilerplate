import type { FirebaseError } from "firebase/app";

/** Mensaje único en UI para no revelar si un email ya existe, etc. */
export const GENERIC_FIREBASE_AUTH_ERROR_MESSAGE =
  "No se pudo crear la cuenta. Revisa tus datos o inicia sesión si ya tienes una cuenta.";

function getFirebaseErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return undefined;
  }
  const code = (error as FirebaseError).code;
  return typeof code === "string" ? code : undefined;
}

function getDetailedFirebaseAuthErrorMessage(error: unknown): string {
  switch (getFirebaseErrorCode(error)) {
    case "auth/email-already-in-use":
      return "Ese email ya está registrado.";
    case "auth/invalid-email":
      return "El email no es válido.";
    case "auth/weak-password":
      return "La contraseña es demasiado débil (mínimo 6 caracteres).";
    case "auth/operation-not-allowed":
      return "El registro por email no está habilitado en Firebase.";
    case "auth/network-request-failed":
      return "Error de red. Comprueba tu conexión.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
    case "auth/user-disabled":
      return "Esta cuenta está deshabilitada.";
    default:
      return "No se pudo completar la operación. Inténtalo de nuevo.";
  }
}

type FirebaseAuthErrorMessageOptions = {
  /** Si true, no expone códigos concretos (anti-enumeración). Por defecto true. */
  safe?: boolean;
};

/**
 * Convierte errores del SDK de Firebase Auth en texto para la UI.
 * En formularios públicos usa safe: true (valor por defecto).
 */
export function getFirebaseAuthErrorMessage(
  error: unknown,
  options?: FirebaseAuthErrorMessageOptions,
): string {
  const safe = options?.safe !== false;
  if (safe) {
    return GENERIC_FIREBASE_AUTH_ERROR_MESSAGE;
  }
  return getDetailedFirebaseAuthErrorMessage(error);
}

/** Solo desarrollo: código Firebase real en consola, no en pantalla. */
export function logFirebaseAuthError(context: string, error: unknown): void {
  if (process.env.NODE_ENV !== "development") return;
  const code = getFirebaseErrorCode(error);
  console.debug(`[${context}] firebase auth`, code ?? error);
}
