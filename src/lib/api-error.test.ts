import { describe, it, expect } from "vitest";
import type { ZodIssue } from "zod";

import { API_ERROR_MESSAGES, jsonApiError } from "@/lib/api-error";

describe("jsonApiError", () => {
  it("devuelve 404 con cuerpo estándar", async () => {
    const res = jsonApiError(API_ERROR_MESSAGES.NOT_FOUND, 404);

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "No encontrado" });
  });

  it("incluye issues en errores de validación", async () => {
    const issues = [
      { code: "too_small", path: ["name"], message: "Requerido" },
    ] as ZodIssue[];
    const res = jsonApiError(API_ERROR_MESSAGES.VALIDATION, 400, { issues });

    expect(await res.json()).toEqual({
      error: "Error de validación",
      issues,
    });
  });
});
