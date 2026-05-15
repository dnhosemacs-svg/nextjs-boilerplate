#!/usr/bin/env node
/**
 * Paso 3/4: callbackUrl unificado (withAuth + login/register + auth-login-form).
 * Uso: npm run verify:callback-url
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function read(rel) {
  return readFileSync(join(ROOT, rel), "utf8");
}

function isSafeInternalPath(value) {
  return !!value && value.startsWith("/") && !value.startsWith("//");
}

const AUTH_ENTRY_PATHS = new Set(["/login", "/register"]);

function isValidPostLoginPath(value) {
  return isSafeInternalPath(value) && !AUTH_ENTRY_PATHS.has(value);
}

/** Formato que withAuth genera al redirigir a signIn (referencia, no importada en app). */
function expectedWithAuthLoginUrl(returnPath) {
  if (!isSafeInternalPath(returnPath)) return "/login";
  return `/login?${new URLSearchParams({ callbackUrl: returnPath }).toString()}`;
}

function getPostLoginDestination(searchParams, fallback = "/dashboard") {
  const callbackUrl = searchParams.get("callbackUrl");
  if (isValidPostLoginPath(callbackUrl)) return callbackUrl;
  const next = searchParams.get("next");
  if (isValidPostLoginPath(next)) return next;
  return fallback;
}

function collectFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (name === "node_modules" || name === ".next") continue;
    const stat = statSync(path);
    if (stat.isFile() && /\.(ts|tsx)$/.test(path)) acc.push(path);
    else if (stat.isDirectory()) collectFiles(path, acc);
  }
  return acc;
}

// —— Contrato de safe-redirect.ts ——
const safeRedirect = read("src/lib/safe-redirect.ts");

assert(
  safeRedirect.includes("export function getPostLoginDestination"),
  "safe-redirect.ts: debe exportar getPostLoginDestination",
);
assert(
  !safeRedirect.includes("export function buildLoginRedirectPath"),
  "safe-redirect.ts: no debe exportar buildLoginRedirectPath (withAuth arma /login?callbackUrl=...)",
);
assert(
  !safeRedirect.includes("export function applyLoginReturnParams"),
  "safe-redirect.ts: no debe exportar applyLoginReturnParams (sin usos)",
);

// —— Unitarias (misma lógica que el módulo) ——
assert(
  expectedWithAuthLoginUrl("/dashboard") === "/login?callbackUrl=%2Fdashboard",
  "withAuth login URL: codifica /dashboard en callbackUrl",
);
assert(
  getPostLoginDestination(new URLSearchParams("callbackUrl=/stats")) === "/stats",
  "getPostLoginDestination: lee callbackUrl",
);
assert(
  getPostLoginDestination(new URLSearchParams("next=/stats")) === "/stats",
  "getPostLoginDestination: sigue aceptando next (enlaces antiguos)",
);
assert(
  getPostLoginDestination(new URLSearchParams()) === "/dashboard",
  "getPostLoginDestination: fallback /dashboard",
);
assert(
  getPostLoginDestination(new URLSearchParams("callbackUrl=/login")) === "/dashboard",
  "getPostLoginDestination: ignora callbackUrl a /login (anti-bucle)",
);
assert(
  getPostLoginDestination(new URLSearchParams("callbackUrl=/register")) === "/dashboard",
  "getPostLoginDestination: ignora callbackUrl a /register (anti-bucle)",
);
assert(
  expectedWithAuthLoginUrl("//evil.com") === "/login",
  "withAuth login URL: bloquea open redirect en callbackUrl",
);

// —— Estáticas en src ——
const srcFiles = collectFiles(join(ROOT, "src"));
for (const file of srcFiles) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  const content = readFileSync(file, "utf8");
  if (/redirect\s*\(\s*[`'"]\/login\?next=/.test(content)) {
    failures.push(`${rel}: usa redirect con ?next=; usar callbackUrl vía withAuth/getPostLoginDestination`);
  }
}

const loginForm = read("src/components/auth-login-form.tsx");
assert(
  loginForm.includes("getPostLoginDestination"),
  "auth-login-form: debe usar getPostLoginDestination tras login",
);
assert(
  /callbackUrl:\s*postLoginDestination/.test(loginForm),
  "auth-login-form: GitHub signIn debe pasar callbackUrl",
);

const loginPage = read("src/app/(public)/login/page.tsx");
const registerPage = read("src/app/(public)/register/page.tsx");

assert(
  loginPage.includes("getPostLoginDestination"),
  "login/page: redirect con sesión debe usar getPostLoginDestination",
);
assert(
  registerPage.includes("getPostLoginDestination"),
  "register/page: redirect con sesión debe usar getPostLoginDestination",
);

for (const rel of [
  "src/app/(app)/dashboard/page.tsx",
  "src/app/(app)/stats/page.tsx",
  "src/app/(app)/tasks/new/page.tsx",
  "src/app/(app)/tasks/[id]/page.tsx",
]) {
  const content = read(rel);
  assert(
    !content.includes("buildLoginRedirectPath"),
    `${rel}: no debe usar buildLoginRedirectPath (middleware protege)`,
  );
  assert(
    !content.includes("getPostLoginDestination"),
    `${rel}: no debe usar getPostLoginDestination (solo tras login, no en páginas privadas)`,
  );
}

if (failures.length > 0) {
  console.error("verify:callback-url — fallos:\n");
  for (const msg of failures) console.error(`  • ${msg}`);
  process.exit(1);
}

console.log("verify:callback-url — OK (safe-redirect mínimo + callbackUrl unificado).");
console.log(
  "  Flujo: ruta protegida → withAuth → /login?callbackUrl=... → login → getPostLoginDestination.",
);
