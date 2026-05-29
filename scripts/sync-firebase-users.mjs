/**
 * Importa usuarios de Firebase Auth a PostgreSQL (tabla users).
 * Uso: cargar .env.local y ejecutar `npm run sync:firebase-users`
 */
process.env.DATABASE_URL =
  process.env.DATABASE_URL?.trim() ?? process.env.DIRECT_URL?.trim();

if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL o DIRECT_URL en el entorno.");
  process.exit(1);
}

const { syncFirebaseUsersToDatabase } = await import(
  "../src/lib/sync-firebase-users.ts"
);

try {
  const result = await syncFirebaseUsersToDatabase();
  console.log(JSON.stringify({ ok: true, ...result }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
