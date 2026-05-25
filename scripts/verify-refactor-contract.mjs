#!/usr/bin/env node
/**
 * Contrato HTTP de rutas refactorizadas (sin sesión): códigos y mensajes esperados.
 * Uso: npm run start && node scripts/verify-refactor-contract.mjs
 */
const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const failures = [];
const passes = [];

function pass(msg) {
  passes.push(msg);
}

function fail(msg) {
  failures.push(msg);
}

function assert(condition, msg) {
  if (condition) pass(msg);
  else fail(msg);
}

async function request(path, init = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    redirect: "manual",
    ...init,
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* not json */
  }
  return { res, text, json };
}

async function main() {
  // Sin sesión el middleware responde 401 antes de parsear el body (defensa en profundidad).
  for (const [label, path] of [
    ["POST /api/tasks", "/api/tasks"],
    ["POST /api/products", "/api/products"],
    ["POST /api/categories", "/api/categories"],
  ]) {
    const { res, json } = await request(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not-json",
    });
    assert(res.status === 401, `${label} sin sesión → 401 (middleware primero)`);
    assert(json?.error === "No autenticado", `${label} cuerpo 401 unificado`);
  }

  // Validación Zod sin sesión: middleware 401 antes del handler
  const { res: taskRes, json: taskJson } = await request("/api/tasks", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "" }),
  });
  assert(taskRes.status === 401, "POST /api/tasks validación: 401 sin sesión (middleware)");
  assert(taskJson?.error === "No autenticado", "POST /api/tasks: cuerpo 401 unificado");

  // Páginas inventario protegidas
  for (const path of ["/products", "/categories"]) {
    const { res } = await request(path);
    const location = res.headers.get("location") ?? "";
    assert(
      res.status === 307 || res.status === 308,
      `GET ${path} sin sesión → redirect (got ${res.status})`,
    );
    assert(
      location.includes("/login") && location.includes("callbackUrl="),
      `GET ${path} → /login?callbackUrl=...`,
    );
  }

  if (failures.length > 0) {
    console.error("verify:refactor-contract — fallos:\n");
    for (const msg of failures) console.error(`  ✗ ${msg}`);
    process.exit(1);
  }

  console.log(`verify:refactor-contract — OK (${passes.length} comprobaciones en ${BASE_URL}).`);
  for (const msg of passes) console.log(`  ✓ ${msg}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
