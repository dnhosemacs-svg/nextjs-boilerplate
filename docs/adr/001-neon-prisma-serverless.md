# ADR-001: Neon PostgreSQL + Prisma en entorno serverless

- **Estado:** Aceptado
- **Fecha:** 2026-06-12
- **Ámbito:** Persistencia (inventario, pedidos, usuarios)

## Contexto

TaskFlow Carpintería se despliega en **Vercel** (funciones serverless, requests cortas, muchas instancias concurrentes). El dominio exige:

- Relaciones entre entidades (`Category` ↔ `Material`, pedidos, reservas de stock, usuarios con roles).
- Transacciones al aprobar pedidos y reservar material.
- Migraciones versionadas y seed en desarrollo.

El runtime de Next.js no mantiene un proceso Node persistente; abrir una conexión TCP nueva por request agotaría el límite de conexiones de Postgres.

## Decisión

Usar **Neon** (PostgreSQL gestionado) con **Prisma 7** y **dos URLs**:

| Variable | Uso | Configuración |
|----------|-----|---------------|
| `DATABASE_URL` | Runtime de la app (`src/lib/db.ts`) | Neon con **connection pooling ON** (pgBouncer) |
| `DIRECT_URL` | CLI Prisma (`migrate`, `generate`, seed) | Neon con **pooling OFF** (conexión directa) |

Implementación:

- Cliente Prisma con adaptador `@prisma/adapter-pg` y singleton en desarrollo (`globalThis`) — ver `src/lib/db.ts`.
- Esquema en `prisma/schema.prisma`; URL del CLI en `prisma.config.ts` → `env("DIRECT_URL")`.
- Migraciones en `prisma/migrations/`; despliegue con `npx prisma migrate deploy`.

## Consecuencias

### Positivas

- Postgres relacional con tipos exactos (`Decimal` para costes y stock).
- Pooler de Neon evita saturar conexiones en serverless.
- Un solo ORM compartido entre Route Handlers, RSC y scripts de seed.

### Negativas / limitaciones

- Dos variables de entorno obligatorias (fácil confundir pool ON/OFF).
- Las migraciones no deben ejecutarse contra `DATABASE_URL` pooled.
- Cold starts: primera query puede ser más lenta; aceptable para el MVP del taller.

## Alternativas consideradas

| Alternativa | Por qué no |
|-------------|------------|
| **SQLite** | Sin relaciones multi-usuario en serverless; no escala en Vercel sin disco compartido. |
| **Supabase / PlanetScale** | Válidos; Neon elegido por simplicidad del tier gratuito y documentación del ejercicio. |
| **Drizzle / TypeORM** | Prisma ya integrado con generador en `src/generated/prisma` y equipo familiarizado. |
| **Una sola URL sin pooler** | Riesgo de `too many connections` en picos de tráfico serverless. |

## Referencias

- `src/lib/db.ts`, `prisma/schema.prisma`, `prisma.config.ts`
- [docs/arquitectura.md — DATABASE_URL vs DIRECT_URL](../arquitectura.md#database_url-pooled-vs-direct_url-migraciones)
- [README — PostgreSQL en Neon](../../README.md#postgresql-en-neon)
