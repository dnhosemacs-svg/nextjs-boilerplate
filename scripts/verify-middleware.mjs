#!/usr/bin/env node
/**
 * Paso 4: proxy (páginas + APIs 401) alineado con protected-api-routes y safe-redirect.
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

// —— Estáticas: middleware + catálogo de APIs ——
const middleware = read("middleware.ts");
const protectedRoutes = read("src/lib/protected-api-routes.ts");

assert(
  /export\s+async\s+function\s+middleware/.test(middleware),
  "middleware.ts: debe exportar async function middleware",
);
assert(
  middleware.includes("getAuthSecret"),
  "middleware.ts: debe usar getAuthSecret() (mismo secreto que auth.ts)",
);
assert(
  middleware.includes("handleProtectedApi"),
  "middleware.ts: debe definir handleProtectedApi para APIs",
);
assert(
  middleware.includes("handleProtectedPage"),
  "middleware.ts: debe definir handleProtectedPage para páginas privadas",
);
assert(
  middleware.includes("isProtectedApiPath"),
  "middleware.ts: debe usar isProtectedApiPath (lista en protected-api-routes.ts)",
);
assert(
  protectedRoutes.includes('"/api/orders"'),
  "protected-api-routes.ts: debe listar /api/orders",
);
assert(
  middleware.includes("getPostLoginDestination"),
  "middleware.ts: redirect con sesión en /login|/register debe usar getPostLoginDestination",
);
assert(
  /NextResponse\.json\([\s\S]*401/.test(middleware),
  "middleware.ts: APIs sin sesión deben devolver 401 JSON",
);

const matcherRoutes = [
  '"/dashboard/:path*"',
  '"/stats"',
  '"/products"',
  '"/products/:path*"',
  '"/categories"',
  '"/categories/:path*"',
  '"/admin"',
  '"/admin/:path*"',
  '"/api/orders/:path*"',
  '"/login"',
  '"/register"',
];
for (const route of matcherRoutes) {
  assert(middleware.includes(route), `middleware.ts: matcher debe incluir ${route}`);
}

// Cada prefijo protegido de API debe tener cobertura en el matcher
const apiPrefixes = [...protectedRoutes.matchAll(/"(\/api\/[^"]+)"/g)].map((m) => m[1]);
for (const prefix of apiPrefixes) {
  assert(
    middleware.includes(`"${prefix}`) || middleware.includes(`${prefix}/:path*`),
    `middleware.ts: matcher debe cubrir API protegida ${prefix}`,
  );
}

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
    if (res.status !== 307 && res.status !== 308 && res.status !== 302) {
      return {
        ok: false,
        detail: `${path}: status ${res.status}, esperado redirect 302/307/308`,
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
    name: "sin sesión /categories → redirect login",
    run: () =>
      probe("/categories", {
        expectRedirect: true,
        locationIncludes: "/login",
      }),
  },
  {
    name: "sin sesión /orders/new → redirect login",
    run: () =>
      probe("/orders/new", {
        expectRedirect: true,
        locationIncludes: "/login",
      }),
  },
  {
    name: "sin sesión GET /api/orders → 401 JSON",
    run: () =>
      probe("/api/orders", {
        expectStatus: 401,
        bodyIncludes: "No autenticado",
      }),
  },
  {
    name: "sin sesión /login → accesible (200)",
    run: () => probe("/login", { expectStatus: 200 }),
  },
  {
    name: "sin sesión /register → accesible (200)",
    run: () => probe("/register", { expectStatus: 200 }),
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
      "\n  Sugerencia: reinicia `npm run dev` tras cambiar middleware.ts,",
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
  "  Modelo: páginas privadas → handleProtectedPage; APIs → isProtectedApiPath + 401 JSON.",
);
