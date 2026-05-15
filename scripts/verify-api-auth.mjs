#!/usr/bin/env node
/**
 * Paso 5: APIs sensibles con doble capa (middleware 401 + requireApiSession en handlers).
 * Uso: npm run verify:api-auth
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function read(rel) {
  return readFileSync(join(ROOT, rel), "utf8");
}

function collectApiRoutes(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) collectApiRoutes(path, acc);
    else if (name === "route.ts") acc.push(path);
  }
  return acc;
}

const protectedRoutes = read("src/lib/protected-api-routes.ts");
const middleware = read("middleware.ts");
const apiAuth = read("src/lib/api-auth.ts");

assert(
  protectedRoutes.includes('"/api/tasks"'),
  "protected-api-routes.ts: debe listar /api/tasks",
);
assert(
  middleware.includes("isProtectedApiPath"),
  "middleware.ts: debe usar isProtectedApiPath (lista centralizada)",
);
assert(
  apiAuth.includes("requireApiSession"),
  "api-auth.ts: debe exportar requireApiSession",
);
assert(
  apiAuth.includes('"No autenticado"'),
  "api-auth.ts: mensaje 401 unificado",
);

const apiRoot = join(ROOT, "src/app/api");
const routeFiles = collectApiRoutes(apiRoot);

for (const file of routeFiles) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  const content = read(rel);

  if (rel.includes("/api/auth/")) {
    if (content.includes("requireApiSession")) {
      failures.push(`${rel}: /api/auth no debe exigir requireApiSession (es público)`);
    }
    continue;
  }

  const isUnderProtectedPrefix = rel.includes("/api/tasks/");
  if (!isUnderProtectedPrefix && !rel.endsWith("api/tasks/route.ts")) {
    failures.push(
      `${rel}: ruta API no catalogada; añádela a protected-api-routes.ts o documenta por qué es pública`,
    );
    continue;
  }

  const handlers = [...content.matchAll(/export async function (GET|POST|PUT|PATCH|DELETE)/g)];
  assert(
    handlers.length > 0,
    `${rel}: sin handlers HTTP exportados`,
  );

  for (const [, method] of handlers) {
    const chunk = content.slice(
      content.indexOf(`export async function ${method}`),
      content.indexOf(`export async function ${method}`) + 400,
    );
    if (!chunk.includes("requireApiSession")) {
      failures.push(`${rel}: ${method} debe llamar a requireApiSession()`);
    }
  }
}

async function probe(path, { method = "GET", expectStatus, bodyIncludes, notRedirect }) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      redirect: "manual",
      headers: method === "POST" ? { "content-type": "application/json" } : undefined,
      body: method === "POST" ? "{}" : undefined,
    });
    const location = res.headers.get("location") ?? "";
    const body = await res.text();

    if (notRedirect && (res.status === 307 || res.status === 308)) {
      return { ok: false, detail: `${path}: no debe redirigir a HTML (got ${location})` };
    }
    if (expectStatus !== undefined && res.status !== expectStatus) {
      return { ok: false, detail: `${path}: status ${res.status}, esperado ${expectStatus}` };
    }
    if (bodyIncludes && !body.includes(bodyIncludes)) {
      return { ok: false, detail: `${path}: body sin "${bodyIncludes}"` };
    }
    return { ok: true };
  } catch {
    return { skipped: true };
  }
}

const httpCases = [
  {
    name: "GET /api/tasks sin sesión → 401 JSON",
    run: () =>
      probe("/api/tasks", {
        expectStatus: 401,
        bodyIncludes: "No autenticado",
        notRedirect: true,
      }),
  },
  {
    name: "POST /api/tasks sin sesión → 401 JSON",
    run: () =>
      probe("/api/tasks", {
        method: "POST",
        expectStatus: 401,
        bodyIncludes: "No autenticado",
        notRedirect: true,
      }),
  },
  {
    name: "GET /api/tasks/fake-id sin sesión → 401 JSON",
    run: () =>
      probe("/api/tasks/test-id", {
        expectStatus: 401,
        bodyIncludes: "No autenticado",
        notRedirect: true,
      }),
  },
  {
    name: "GET /api/auth/session sin sesión → público (200)",
    run: () => probe("/api/auth/session", { expectStatus: 200, notRedirect: true }),
  },
];

let httpRan = 0;
let httpSkipped = false;

for (const { name, run } of httpCases) {
  const result = await run();
  if (result.skipped) {
    httpSkipped = true;
    break;
  }
  httpRan += 1;
  if (!result.ok) failures.push(`HTTP: ${name} — ${result.detail}`);
}

if (failures.length > 0) {
  console.error("verify:api-auth — fallos:\n");
  for (const msg of failures) console.error(`  • ${msg}`);
  process.exit(1);
}

if (httpSkipped) {
  console.log("verify:api-auth — OK (estáticas). HTTP omitidas: servidor no disponible.");
  console.log("  Prueba: npm run build && npm run start && npm run verify:api-auth");
} else {
  console.log(`verify:api-auth — OK (estáticas + ${httpRan} pruebas HTTP en ${BASE_URL}).`);
}
