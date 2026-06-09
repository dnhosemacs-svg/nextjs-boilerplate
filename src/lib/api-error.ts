import { NextResponse } from "next/server";
import type { ZodIssue } from "zod";

/** Cuerpo JSON estándar para respuestas 4xx/5xx de la API. */
export type ApiErrorBody = {
  error: string;
  issues?: ZodIssue[];
};

/** Mensajes reutilizables (evita strings sueltos en rutas). */
export const API_ERROR_MESSAGES = {
  UNAUTHORIZED: "No autenticado",
  FORBIDDEN: "Prohibido",
  NOT_FOUND: "No encontrado",
  INVALID_JSON: "Cuerpo JSON no válido",
  VALIDATION: "Error de validación",
} as const;

/** Construye NextResponse con el JSON de error estándar. */
export function jsonApiError(
  message: string,
  status: number,
  extra?: Pick<ApiErrorBody, "issues">,
): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: message, ...extra }, { status });
}
