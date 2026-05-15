import type { FirebaseError } from "firebase/app";

function getFirebaseErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return undefined;
  }
  const code = (error as FirebaseError).code;
  return typeof code === "string" ? code : undefined;
}

/**
 * Convierte errores del SDK de Firebase Auth en mensajes legibles para la UI.
 * Usar en formularios de registro/login en el cliente.
 */
export function getFirebaseAuthErrorMessage(error: unknown): string {
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
