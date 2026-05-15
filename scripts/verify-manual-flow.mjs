#!/usr/bin/env node
/**
 * Paso 5: flujo auth end-to-end vía HTTP (sin sesión + anti-bucles + login opcional).
 *
 * Uso:
 *   npm run start   # o npm run dev
 *   npm run verify:manual-flow
 *
 * Login con sesión (opcional):
 *   E2E_TEST_EMAIL=... E2E_TEST_PASSWORD=... npm run verify:manual-flow
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const MAX_REDIRECTS = 8;

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

async function fetchManual(url, init = {}) {
  return fetch(url, { redirect: "manual", ...init });
}

/** Sigue redirects y detecta bucles por URL repetida. */
async function followRedirects(startPath, { maxHops = MAX_REDIRECTS, headers } = {}) {
  const chain = [];
  let url = startPath.startsWith("http") ? startPath : `${BASE_URL}${startPath}`;

  for (let hop = 0; hop < maxHops; hop += 1) {
    const res = await fetchManual(url, headers ? { headers } : {});
    const location = res.headers.get("location");
    chain.push({
      url,
      status: res.status,
      location: location ?? null,
    });

    if (res.status !== 307 && res.status !== 308) {
      return { chain, final: res, loop: false };
    }

    if (!location) {
      return { chain, final: res, loop: false, error: "redirect sin Location" };
    }

    const nextUrl = new URL(location, url).href;
    const seen = chain.filter((c) => c.url === nextUrl);
    if (seen.length > 0) {
      return { chain, loop: true, loopUrl: nextUrl };
    }

    url = nextUrl;
  }

  return { chain, loop: true, tooMany: true };
}

function parseSetCookie(res) {
  const headers = res.headers.getSetCookie?.() ?? [];
  if (headers.length > 0) return headers;
  const single = res.headers.get("set-cookie");
  return single ? [single] : [];
}

function cookieJarFromResponses(responses) {
  const jar = new Map();
  for (const res of responses) {
    for (const raw of parseSetCookie(res)) {
      const name = raw.split("=")[0]?.trim();
      if (!name) continue;
      jar.set(name, raw.split(";")[0]);
    }
  }
  return [...jar.values()].join("; ");
}

async function tryCredentialsLogin(email, password) {
  const csrfRes = await fetchManual(`${BASE_URL}/api/auth/csrf`);
  if (!csrfRes.ok) return { ok: false, reason: `csrf status ${csrfRes.status}` };

  const csrfBody = await csrfRes.json();
  const csrfToken = csrfBody.csrfToken;
  if (!csrfToken) return { ok: false, reason: "sin csrfToken" };

  const csrfCookies = cookieJarFromResponses([csrfRes]);

  const body = new URLSearchParams({
    csrfToken,
    email,
    password,
    redirect: "false",
    json: "true",
    callbackUrl: `${BASE_URL}/dashboard`,
  });

  const signInRes = await fetchManual(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      cookie: csrfCookies,
    },
    body,
  });

  const allCookies = [csrfCookies, cookieJarFromResponses([signInRes])]
    .filter(Boolean)
    .join("; ");

  let signInJson = null;
  try {
    signInJson = await signInRes.json();
  } catch {
    /* HTML error page */
  }

  if (signInRes.status !== 200 || signInJson?.error) {
    return {
      ok: false,
      reason: signInJson?.error ?? `signIn status ${signInRes.status}`,
    };
  }

  return { ok: true, cookie: allCookies };
}

async function runAnonymousTests() {
  const protectedPages = [
    { path: "/dashboard", expectCallback: "/dashboard" },
    { path: "/stats", expectCallback: "/stats" },
    { path: "/tasks/new", expectCallback: "/tasks/new" },
    { path: "/tasks/demo-001", expectCallback: "/tasks/demo-001" },
  ];

  for (const { path, expectCallback } of protectedPages) {
    const { chain, loop, final } = await followRedirects(path);
    assert(!loop, `${path}: sin bucle de redirects (${chain.length} saltos)`);
    assert(
      chain.length <= 3,
      `${path}: cadena corta de redirect (got ${chain.length})`,
    );
    const loginRedirect = chain.find(
      (hop) =>
        hop.status === 307 ||
        hop.status === 308 ||
        hop.location?.includes("/login"),
    );
    const loginLocation = loginRedirect?.location ?? "";
    assert(
      loginLocation.includes("/login") && loginLocation.includes("callbackUrl="),
      `${path}: redirect a /login?callbackUrl=... (got: ${loginLocation || "sin Location"})`,
    );
    assert(
      decodeURIComponent(loginLocation).includes(expectCallback),
      `${path}: callbackUrl contiene ${expectCallback}`,
    );
    assert(
      final?.status === 200 || chain.some((c) => c.url.includes("/login")),
      `${path}: termina en login accesible o 200`,
    );
  }

  const apiCases = [
    { path: "/api/tasks", method: "GET" },
    { path: "/api/tasks", method: "POST", body: "{}" },
    { path: "/api/tasks/fake-id", method: "GET" },
  ];

  for (const { path, method, body } of apiCases) {
    const res = await fetchManual(`${BASE_URL}${path}`, {
      method,
      headers: body ? { "content-type": "application/json" } : undefined,
      body,
    });
    const text = await res.text();
    assert(res.status === 401, `${method} ${path}: status 401`);
    assert(text.includes("No autenticado"), `${method} ${path}: body JSON de error`);
    assert(!res.headers.get("location")?.includes("/login"), `${method} ${path}: sin redirect HTML a login`);
  }

  for (const path of ["/login", "/register", "/"]) {
    const res = await fetchManual(`${BASE_URL}${path}`);
    assert(res.status === 200, `${path}: accesible sin sesión (200)`);
  }

  const loginLoop = await followRedirects("/login?callbackUrl=%2Flogin");
  assert(!loginLoop.loop, "/login?callbackUrl=/login: sin bucle (visitante anónimo)");

  const safeRedirect = readFileSync(join(ROOT, "src/lib/safe-redirect.ts"), "utf8");
  assert(
    safeRedirect.includes("AUTH_ENTRY_PATHS"),
    "safe-redirect: bloqueo de destinos /login y /register",
  );
}

async function runAuthenticatedTests(cookie) {
  const headers = { cookie };

  for (const path of ["/login", "/register", "/login?callbackUrl=%2Flogin"]) {
    const { chain, loop } = await followRedirects(path, { headers });

    assert(!loop, `con sesión ${path}: sin bucle de redirects`);
    const lastHop = chain.at(-1);
    const finalPathname = new URL(lastHop?.location ?? lastHop?.url ?? BASE_URL).pathname;
    assert(
      finalPathname !== "/login" && finalPathname !== "/register",
      `con sesión ${path}: redirige fuera de login/register (got ${finalPathname})`,
    );
    if (path.includes("callbackUrl=%2Flogin")) {
      assert(
        finalPathname === "/dashboard" ||
          chain.some((c) => decodeURIComponent(c.location ?? "").includes("/dashboard")),
        "con sesión /login?callbackUrl=/login: destino seguro (/dashboard)",
      );
    }
  }

  const dash = await fetchManual(`${BASE_URL}/dashboard`, { headers });
  assert(
    dash.status === 200,
    "con sesión /dashboard: 200 (sin redirect a login)",
  );

  const tasks = await fetchManual(`${BASE_URL}/api/tasks`, { headers });
  assert(
    tasks.status === 200,
    "con sesión GET /api/tasks: 200",
  );
}

async function main() {
  let serverUp = false;
  try {
    const ping = await fetchManual(`${BASE_URL}/`);
    serverUp = ping.status === 200;
  } catch {
    serverUp = false;
  }

  if (!serverUp) {
    console.error("verify:manual-flow — servidor no disponible en", BASE_URL);
    console.error("  Arranca: npm run dev  o  npm run build && npm run start");
    process.exit(1);
  }

  await runAnonymousTests();

  const email = process.env.E2E_TEST_EMAIL?.trim();
  const password = process.env.E2E_TEST_PASSWORD?.trim();

  if (email && password) {
    const login = await tryCredentialsLogin(email, password);
    if (login.ok) {
      await runAuthenticatedTests(login.cookie);
      pass("login E2E con E2E_TEST_EMAIL: OK");
    } else {
      fail(`login E2E: ${login.reason} (revisa credenciales Firebase)`);
    }
  } else {
    passes.push(
      "con sesión: omitido (define E2E_TEST_EMAIL y E2E_TEST_PASSWORD para probar login real)",
    );
  }

  console.log("verify:manual-flow — resultados:\n");
  for (const msg of passes) console.log(`  ✓ ${msg}`);
  if (failures.length > 0) {
    console.error("\n  Fallos:");
    for (const msg of failures) console.error(`  ✗ ${msg}`);
    process.exit(1);
  }

  console.log(`\nverify:manual-flow — OK (${passes.length} comprobaciones en ${BASE_URL}).`);
  if (!email || !password) {
    console.log(
      "  Opcional: E2E_TEST_EMAIL=... E2E_TEST_PASSWORD=... npm run verify:manual-flow",
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
