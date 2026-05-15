/** Códigos que lanza `authorize` en src/lib/auth.ts y que NextAuth devuelve en `result.error`. */
export const CREDENTIALS_SIGN_IN_ERROR_CODES = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  NETWORK_ERROR: "NETWORK_ERROR",
  CONFIG_ERROR: "CONFIG_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  /** Fallback genérico de NextAuth cuando `authorize` devuelve `null`. */
  CredentialsSignin: "CredentialsSignin",
} as const;

export type CredentialsSignInErrorCode =
  (typeof CREDENTIALS_SIGN_IN_ERROR_CODES)[keyof typeof CREDENTIALS_SIGN_IN_ERROR_CODES];

const MESSAGES: Record<string, string> = {
  [CREDENTIALS_SIGN_IN_ERROR_CODES.INVALID_CREDENTIALS]:
    "Credenciales inválidas.",
  [CREDENTIALS_SIGN_IN_ERROR_CODES.CredentialsSignin]:
    "Credenciales inválidas.",
  [CREDENTIALS_SIGN_IN_ERROR_CODES.NETWORK_ERROR]:
    "Error de red. Comprueba tu conexión e inténtalo de nuevo.",
  [CREDENTIALS_SIGN_IN_ERROR_CODES.CONFIG_ERROR]:
    "El inicio de sesión no está configurado correctamente. Contacta con el administrador.",
  [CREDENTIALS_SIGN_IN_ERROR_CODES.UNKNOWN_ERROR]:
    "No se pudo iniciar sesión. Inténtalo de nuevo.",
};

const DEFAULT_MESSAGE = MESSAGES[CREDENTIALS_SIGN_IN_ERROR_CODES.UNKNOWN_ERROR];

/** Traduce `result.error` de `signIn("credentials")` a texto para la UI. */
export function getCredentialsSignInErrorMessage(
  errorCode: string | null | undefined,
): string {
  if (!errorCode) return DEFAULT_MESSAGE;
  return MESSAGES[errorCode] ?? DEFAULT_MESSAGE;
}
