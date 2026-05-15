#!/usr/bin/env node
/**
 * Paso 4: páginas (app) sin guards duplicados; protección vía middleware + login/register.
 * Uso: npm run verify:page-guards
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

function collectPages(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) collectPages(path, acc);
    else if (name === "page.tsx") acc.push(path);
  }
  return acc;
}

const appPages = collectPages(join(ROOT, "src/app/(app)"));

for (const file of appPages) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  const content = read(rel);

  if (content.includes("getServerSession")) {
    failures.push(`${rel}: no debe usar getServerSession (middleware protege la ruta)`);
  }
  if (content.includes("buildLoginRedirectPath")) {
    failures.push(`${rel}: no debe usar buildLoginRedirectPath (redirect en middleware)`);
  }
  if (/redirect\s*\(\s*buildLoginRedirectPath/.test(content)) {
    failures.push(`${rel}: guard de sesión duplicado`);
  }
}

const loginPage = read("src/app/(public)/login/page.tsx");
const registerPage = read("src/app/(public)/register/page.tsx");

assert(
  loginPage.includes("getServerSession") && loginPage.includes("redirect"),
  "login/page.tsx: debe redirigir si ya hay sesión (único guard en páginas públicas)",
);
assert(
  registerPage.includes("getServerSession") &&
    registerPage.includes("redirect") &&
    registerPage.includes("getPostLoginDestination"),
  "register/page.tsx: debe redirigir con getPostLoginDestination si ya hay sesión",
);
assert(
  loginPage.includes("getPostLoginDestination"),
  "login/page.tsx: debe usar getPostLoginDestination al redirigir con sesión",
);

const middleware = read("middleware.ts");
for (const route of ["/dashboard", "/stats", "/tasks", "/login", "/register"]) {
  assert(middleware.includes(`"${route}`), `middleware.ts: matcher debe cubrir ${route}`);
}

if (failures.length > 0) {
  console.error("verify:page-guards — fallos:\n");
  for (const msg of failures) console.error(`  • ${msg}`);
  process.exit(1);
}

console.log("verify:page-guards — OK (sin guards duplicados en (app); login/register conservan redirect).");
console.log("  Protección de páginas privadas: solo middleware.ts (+ sesión en layout para UI).");
