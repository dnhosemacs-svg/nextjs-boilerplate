// Carga .env para el CLI (migrate, generate, studio).
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migraciones: conexión directa Neon (sin pooler). La app usará DATABASE_URL en runtime.
    url: env("DIRECT_URL"),
  },
});
