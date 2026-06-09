import { NextResponse } from "next/server";
import type { ZodError } from "zod";

import { API_ERROR_MESSAGES, jsonApiError } from "@/lib/api-error";

export function invalidJsonResponse() {
  return jsonApiError(API_ERROR_MESSAGES.INVALID_JSON, 400);
}

export function validationErrorResponse(error: ZodError) {
  return jsonApiError(API_ERROR_MESSAGES.VALIDATION, 400, {
    issues: error.issues,
  });
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
  params: Promise<{ id: string }>;
};
