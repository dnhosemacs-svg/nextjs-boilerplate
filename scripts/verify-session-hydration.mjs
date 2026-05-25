#!/usr/bin/env node
/**
 * Paso 6: comprobaciones estáticas de navegación + sesión (useSession / signOut).
 * Uso: npm run verify:session
 */
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(relPath) {
  return readFileSync(join(ROOT, relPath), "utf8");
}

function fileExists(relPath) {
  try {
    statSync(join(ROOT, relPath));
    return true;
  } catch {
    return false;
  }
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const failures = [];

const layout = read("src/app/layout.tsx");
const providers = read("src/components/providers.tsx");
const publicLayout = read("src/app/(public)/layout.tsx");
const siteNavbar = read("src/components/site-navbar.tsx");
const privateHeader = read("src/components/private/private-header.tsx");
const homeAuthCta = read("src/components/home-auth-cta.tsx");
const homePage = read("src/app/(public)/page.tsx");

// —— Paso 0: sesión inicial en raíz ——
assert(
  layout.includes("getServerSession(authOptions)"),
  "layout.tsx: falta getServerSession(authOptions)",
);
assert(
  layout.includes("<Providers session={session}>"),
  "layout.tsx: Providers debe recibir session={session}",
);
assert(
  providers.includes("SessionProvider") && providers.includes("session={session}"),
  "providers.tsx: SessionProvider debe recibir la prop session",
);

// —— Paso 2: layout público sin booleano de sesión ——
assert(
  !publicLayout.includes("getServerSession"),
  "(public)/layout.tsx: no debe duplicar getServerSession (una sola fuente en root)",
);
assert(
  !publicLayout.includes("isAuthenticated"),
  "(public)/layout.tsx: no debe pasar isAuthenticated al navbar",
);
assert(
  publicLayout.includes("<SiteNavbar />") || publicLayout.includes("<SiteNavbar/>"),
  "(public)/layout.tsx: debe renderizar SiteNavbar sin props",
);

// —— Paso 1: navbar con sesión real ——
assert(siteNavbar.includes("useSession"), "site-navbar.tsx: debe usar useSession()");
assert(siteNavbar.includes("signOut"), "site-navbar.tsx: logout debe usar signOut()");
assert(
  !/export default function SiteNavbar\s*\(\s*\{[^}]*isAuthenticated/.test(siteNavbar),
  "site-navbar.tsx: SiteNavbar no debe recibir prop isAuthenticated del layout",
);
assert(
  siteNavbar.includes('status === "loading"'),
  "site-navbar.tsx: debe manejar status loading",
);
assert(
  siteNavbar.includes("sessionUserLabel"),
  "site-navbar.tsx: debe mostrar datos reales de session.user",
);

// —— Paso 4: header privado ——
assert(
  privateHeader.includes("useSession"),
  "private-header.tsx: debe usar useSession()",
);
assert(
  privateHeader.includes("signOut"),
  "private-header.tsx: logout debe usar signOut()",
);
assert(
  privateHeader.includes("sessionUserLabel"),
  "private-header.tsx: debe mostrar datos reales de session.user",
);
assert(
  !privateHeader.includes("isAuthenticated:"),
  "private-header.tsx: no debe depender de prop isAuthenticated",
);

// —— Paso 5: CTAs del home ——
assert(
  homeAuthCta.includes("useSession"),
  "home-auth-cta.tsx: debe usar useSession()",
);
assert(
  homeAuthCta.includes('href="/dashboard"') && homeAuthCta.includes('href="/login"'),
  "home-auth-cta.tsx: debe enlazar a /dashboard (logueado) y /login (invitado)",
);
assert(
  homePage.includes("HomeAuthCta"),
  "(public)/page.tsx: debe usar HomeAuthCta en lugar de links fijos a login",
);

// —— Paso 3: sin panel demo obsoleto ——
assert(
  !fileExists("src/components/auth-session-controls.tsx"),
  "auth-session-controls.tsx: eliminar (migrado o sustituido por useSession en UI)",
);

for (const obsolete of [
  "src/components/session-provider.tsx",
  "src/components/session-debug.tsx",
]) {
  if (fileExists(obsolete)) {
    failures.push(`${obsolete}: archivo de diagnóstico obsoleto`);
  }
}

for (const page of [
  "src/app/(public)/login/page.tsx",
  "src/app/(app)/dashboard/page.tsx",
]) {
  const content = read(page);
  assert(
    !content.includes("SessionDebug") && !content.includes("session-debug"),
    `${page}: no debe importar SessionDebug`,
  );
}

if (failures.length > 0) {
  console.error("verify:session — fallos:\n");
  for (const msg of failures) console.error(`  • ${msg}`);
  process.exit(1);
}

console.log(
  "verify:session — OK (navegación + sesión: layout, navbar, header privado, home CTA).",
);
