import { describe, it, expect } from "vitest";

import {
  invalidJsonResponse,
  parseJsonBody,
  resolveRouteParams,
} from "./api-route-utils";

describe("parseJsonBody", () => {
  it("devuelve ok:true con JSON válido", async () => {
    const request = new Request("http://localhost/api/materials", {
      method: "POST",
      body: JSON.stringify({ name: "Tablero" }),
    });

    const result = await parseJsonBody(request);

    expect(result).toEqual({ ok: true, data: { name: "Tablero" } });
  });

  it("devuelve ok:false con JSON inválido", async () => {
    const request = new Request("http://localhost/api/materials", {
      method: "POST",
      body: "{ no-json",
    });

    const result = await parseJsonBody(request);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
      const body = await result.response.json();
      expect(body.error).toBe("Cuerpo JSON no válido");
    }
  });
});

describe("invalidJsonResponse", () => {
  it("devuelve 400 con mensaje de JSON inválido", async () => {
    const response = invalidJsonResponse();

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Cuerpo JSON no válido" });
  });
});

describe("resolveRouteParams", () => {
  it("resuelve params síncronos y asíncronos", async () => {
    await expect(resolveRouteParams({ id: "abc" })).resolves.toEqual({ id: "abc" });
    await expect(resolveRouteParams(Promise.resolve({ id: "xyz" }))).resolves.toEqual({
      id: "xyz",
    });
  });
});
