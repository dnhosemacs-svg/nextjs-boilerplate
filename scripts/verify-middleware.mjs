#!/usr/bin/env node
/**
 * Paso 3: verifica protección de rutas vía middleware (withAuth + APIs).
 * Comprobaciones estáticas en middleware.ts y, si el servidor responde, pruebas HTTP.
 *
 * Uso:
 *   npm run verify:middleware
 *   npm run start   # en otra terminal, o BASE_URL=https://tu-app.vercel.app
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function read(relPath) {
  return readFileSync(join(ROOT, relPath), "utf8");
}

// —— Estáticas: middleware.ts ——
const middleware = read("middleware.ts");

assert(
  middleware.includes('from "next-auth/middleware"'),
  "middleware.ts: debe importar from \"next-auth/middleware\"",
);
assert(
  /withAuth\s*\(/.test(middleware),
  "middleware.ts: debe usar withAuth(...)",
);
assert(
  /signIn:\s*["']\/login["']/.test(middleware),
  "middleware.ts: pages.signIn debe ser \"/login\"",
);
assert(
  middleware.includes("getAuthSecret"),
  "middleware.ts: debe usar getAuthSecret() (mismo secreto que auth.ts)",
);
assert(
  /pathname\.startsWith\(["']\/api\/tasks["']\)/.test(middleware),
  "middleware.ts: debe proteger /api/tasks con bloque aparte (401 JSON)",
);
assert(
  /NextResponse\.json\([\s\S]*401/.test(middleware),
  "middleware.ts: APIs sin sesión deben devolver 401 JSON",
);
assert(
  middleware.includes('"/dashboard/:path*"'),
  "middleware.ts: matcher debe incluir /dashboard/:path*",
);
assert(
  middleware.includes('"/stats"'),
  "middleware.ts: matcher debe incluir /stats",
);
assert(
  middleware.includes('"/api/tasks/:path*"'),
  "middleware.ts: matcher debe incluir /api/tasks/:path*",
);

// —— HTTP (solo si el servidor está arriba) ——
async function probe(
  path,
  { expectStatus, expectRedirect, locationIncludes, bodyIncludes },
) {
  const url = `${BASE_URL}${path}`;
  let res;
  try {
    res = await fetch(url, { redirect: "manual" });
  } catch (err) {
    return { skipped: true, reason: err instanceof Error ? err.message : String(err) };
  }

  const location = res.headers.get("location") ?? "";
  let body = "";
  try {
    body = await res.text();
  } catch {
    body = "";
  }

  if (expectRedirect) {
    if (res.status !== 307 && res.status !== 308) {
      return {
        ok: false,
        detail: `${path}: status ${res.status}, esperado redirect 307/308`,
      };
    }
  } else if (expectStatus !== undefined && res.status !== expectStatus) {
    return {
      ok: false,
      detail: `${path}: status ${res.status}, esperado ${expectStatus}`,
    };
  }

  if (locationIncludes && !location.includes(locationIncludes)) {
    return {
      ok: false,
      detail: `${path}: Location no contiene "${locationIncludes}" (got: ${location || "(vacío)"})`,
    };
  }

  if (bodyIncludes && !body.includes(bodyIncludes)) {
    return {
      ok: false,
      detail: `${path}: body no contiene "${bodyIncludes}"`,
    };
  }

  return { ok: true, status: res.status, location };
}

const httpCases = [
  {
    name: "sin sesión /dashboard → redirect login + callbackUrl",
    run: async () => {
      const r = await probe("/dashboard", {
        expectRedirect: true,
        locationIncludes: "/login",
      });
      if (r.skipped || !r.ok) return r;
      const loc = r.location ?? "";
      if (!loc.includes("callbackUrl=")) {
        return {
          ok: false,
          detail: `/dashboard: Location debe incluir callbackUrl= (got: ${loc})`,
        };
      }
      if (!decodeURIComponent(loc).includes("/dashboard")) {
        return {
          ok: false,
          detail: `/dashboard: callbackUrl debe apuntar a /dashboard (got: ${loc})`,
        };
      }
      return { ok: true };
    },
  },
  {
    name: "sin sesión /stats → redirect login",
    run: () =>
      probe("/stats", {
        expectRedirect: true,
        locationIncludes: "/login",
      }),
  },
  {
    name: "sin sesión /tasks/new → redirect login",
    run: () =>
      probe("/tasks/new", {
        expectRedirect: true,
        locationIncludes: "/login",
      }),
  },
  {
    name: "sin sesión GET /api/tasks → 401 JSON",
    run: () =>
      probe("/api/tasks", {
        expectStatus: 401,
        bodyIncludes: "No autenticado",
      }),
  },
  {
    name: "sin sesión /login → accesible (200)",
    run: () => probe("/login", { expectStatus: 200 }),
  },
  {
    name: "sin sesión / → pública (200)",
    run: () => probe("/", { expectStatus: 200 }),
  },
];

let httpSkipped = false;
let httpRan = 0;

for (const { name, run } of httpCases) {
  const result = await run();
  if (result.skipped) {
    httpSkipped = true;
    break;
  }
  httpRan += 1;
  if (!result.ok) {
    failures.push(`HTTP: ${name} — ${result.detail}`);
  }
}

if (failures.length > 0) {
  const looksLikeStaleDev = failures.some((m) =>
    m.includes("status 200, esperado redirect"),
  );
  console.error("verify:middleware — fallos:\n");
  for (const msg of failures) console.error(`  • ${msg}`);
  if (looksLikeStaleDev) {
    console.error(
      "\n  Sugerencia: reinicia `npm run dev` tras cambiar middleware/proxy,",
    );
    console.error(
      "  o prueba contra build de producción: npm run build && npm run start",
    );
    console.error("  y luego: BASE_URL=http://localhost:3000 npm run verify:middleware");
  }
  process.exit(1);
}

if (httpSkipped) {
  console.log(
    "verify:middleware — OK (estáticas). HTTP omitidas: servidor no disponible en",
    BASE_URL,
  );
  console.log("  Para pruebas HTTP: npm run build && npm run start");
  process.exit(0);
}

console.log(
  `verify:middleware — OK (estáticas + ${httpRan} pruebas HTTP en ${BASE_URL}).`,
);
console.log(
  "  Prueba manual pendiente: login → /dashboard y usuario logueado en /login → redirect.",
);
