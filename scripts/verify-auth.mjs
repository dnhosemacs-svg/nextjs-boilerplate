#!/usr/bin/env node
/**
 * Paso 7: comprueba que no queden restos del auth demo / rutas custom de login.
 * Uso: npm run verify:auth
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");

const SCAN_ROOTS = [
  join(ROOT, "src"),
  join(ROOT, "middleware.ts"),
];

const REQUIRED_FILES = [
  "src/app/api/auth/[...nextauth]/route.ts",
  "src/lib/auth.ts",
  "src/components/auth-login-form.tsx",
  "src/lib/safe-redirect.ts",
  "src/lib/credentials-sign-in-errors.ts",
];

/** [RegExp, descripción] — solo en código fuente (no README). */
const FORBIDDEN = [
  [/fetch\s*\(\s*[`'"]\/api\/auth\/login/g, 'fetch("/api/auth/login")'],
  [/api\/auth\/login\/route/g, "ruta src/app/api/auth/login/route"],
  [/api\/auth\/logout\/route/g, "ruta src/app/api/auth/logout/route"],
  [/login-demo-banner/g, "clase/CSS login-demo-banner"],
  [/admin@taller|password123|credenciales\s+demo/gi, "credenciales demo en código"],
];

const AUTH_FILES_FOR_COOKIE_CHECK = [
  "src/components/auth-login-form.tsx",
  "src/components/auth-register-form.tsx",
  "src/lib/auth.ts",
  "middleware.ts",
];

function collectFiles(path, acc = []) {
  if (!statSync(path, { throwIfNoEntry: false })) return acc;
  const stat = statSync(path);
  if (stat.isFile()) {
    if (/\.(ts|tsx|js|jsx|mjs)$/.test(path)) acc.push(path);
    return acc;
  }
  if (stat.isDirectory()) {
    const skip = ["node_modules", ".next", ".git"];
    for (const name of readdirSync(path)) {
      if (skip.includes(name)) continue;
      collectFiles(join(path, name), acc);
    }
  }
  return acc;
}

function rel(file) {
  return relative(ROOT, file).replace(/\\/g, "/");
}

const failures = [];

for (const file of REQUIRED_FILES) {
  try {
    statSync(join(ROOT, file));
  } catch {
    failures.push(`Falta archivo requerido: ${file}`);
  }
}

const files = SCAN_ROOTS.flatMap((root) => collectFiles(root));

for (const file of files) {
  const content = readFileSync(file, "utf8");
  const path = rel(file);

  for (const [pattern, label] of FORBIDDEN) {
    if (pattern.test(content)) {
      failures.push(`${path}: patrón prohibido (${label})`);
      pattern.lastIndex = 0;
    }
  }

  if (AUTH_FILES_FOR_COOKIE_CHECK.some((p) => path === p || path.endsWith(p))) {
    if (/document\.cookie/.test(content)) {
      failures.push(`${path}: document.cookie en módulo de auth (usar NextAuth)`);
    }
  }
}

const loginFormPath = join(ROOT, "src/components/auth-login-form.tsx");
const loginForm = readFileSync(loginFormPath, "utf8");
if (!/signIn\s*\(\s*["']credentials["']/.test(loginForm)) {
  failures.push("auth-login-form.tsx: falta signIn('credentials', ...)");
}
if (!/redirect:\s*false/.test(loginForm)) {
  failures.push("auth-login-form.tsx: credentials debe usar redirect: false");
}
if (!/getPostLoginDestination/.test(loginForm)) {
  failures.push("auth-login-form.tsx: falta getPostLoginDestination");
}
if (!/getCredentialsSignInErrorMessage/.test(loginForm)) {
  failures.push("auth-login-form.tsx: falta getCredentialsSignInErrorMessage");
}

if (failures.length > 0) {
  console.error("verify:auth — fallos:\n");
  for (const msg of failures) console.error(`  • ${msg}`);
  process.exit(1);
}

console.log("verify:auth — OK (sin restos del flujo demo ni rutas login custom).");
