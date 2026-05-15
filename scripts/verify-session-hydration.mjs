#!/usr/bin/env node
/**
 * Paso 5: comprobaciones estáticas para evitar regresiones de hydration
 * con SessionProvider / useSession.
 * Uso: npm run verify:session
 */
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(relPath) {
  return readFileSync(join(ROOT, relPath), "utf8");
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const failures = [];

const layout = read("src/app/layout.tsx");
const providers = read("src/components/providers.tsx");
const publicLayout = read("src/app/(public)/layout.tsx");
const siteNavbar = read("src/components/site-navbar.tsx");

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
assert(
  !publicLayout.includes("getServerSession"),
  "(public)/layout.tsx: no debe duplicar getServerSession (una sola fuente en root)",
);
assert(
  !publicLayout.includes("isAuthenticated"),
  "(public)/layout.tsx: no debe pasar isAuthenticated al navbar",
);
assert(
  siteNavbar.includes("useSession"),
  "site-navbar.tsx: debe usar useSession()",
);
assert(
  !siteNavbar.includes("isAuthenticated:"),
  "site-navbar.tsx: no debe depender de prop isAuthenticated",
);
assert(
  siteNavbar.includes('status === "loading"'),
  "site-navbar.tsx: debe manejar status loading sin cambiar estructura bruscamente",
);

try {
  statSync(join(ROOT, "src/components/session-provider.tsx"));
  failures.push(
    "session-provider.tsx: archivo obsoleto (usar providers.tsx)",
  );
} catch {
  // ok — ya eliminado
}

if (failures.length > 0) {
  console.error("verify:session — fallos:\n");
  for (const msg of failures) console.error(`  • ${msg}`);
  process.exit(1);
}

console.log(
  "verify:session — OK (layout + Providers + navbar alineados para hydration).",
);
