import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function invalidJsonResponse() {
  return NextResponse.json({ error: "Cuerpo JSON no válido" }, { status: 400 });
}

export function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    { error: "Error de validación", issues: error.issues },
    { status: 400 },
  );
}

export async function parseJsonBody(
  request: Request,
): Promise<
  { ok: true; data: unknown } | { ok: false; response: NextResponse }
> {
  try {
    return { ok: true, data: await request.json() };
  } catch {
    return { ok: false, response: invalidJsonResponse() };
  }
}

export async function resolveRouteParams<T extends Record<string, string>>(
  params: T | Promise<T>,
): Promise<T> {
  return Promise.resolve(params);
}

export type IdRouteContext = {
  params: { id: string } | Promise<{ id: string }>;
};
