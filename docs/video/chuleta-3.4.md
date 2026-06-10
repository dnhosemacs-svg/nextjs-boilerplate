# Tarjeta 3.4 — Chuleta arquitectura (1 página)

> **Uso:** tener abierta al grabar el bloque 1:45–3:30 del guión 3.2.  
> **Demo:** https://nextjs-boilerplate-sigma-eosin-30.vercel.app/products  
> **Diagrama ampliado:** [`diagrama-arquitectura.md`](./diagrama-arquitectura.md)

---

## Checklist

| # | Punto | ☐ |
|---|--------|---|
| 1 | Auth en 3 capas (Firebase → NextAuth → Postgres) | ☐ |
| 2 | Proxy + `requireRole` (defensa en profundidad) | ☐ |
| 3 | Flujo `/products` → API → Prisma | ☐ |
| 4 | Físico / reservado / disponible (fórmula) | ☐ |
| 5 | Repasar esta chuleta antes de grabar | ☐ |

---

## 1. Auth en 3 capas

| Capa | Dónde | Qué hace | Frase en vídeo |
|------|-------|----------|----------------|
| **Firebase Auth** | `firebase-auth-rest.ts` (login servidor), `firebase-client.ts` (registro) | Valida email/contraseña; **no** guarda la contraseña en la app | «Firebase verifica credenciales; yo no persisto hashes.» |
| **NextAuth (JWT)** | `src/lib/auth.ts`, `/api/auth/[...nextauth]` | Sesión en cookie firmada; `session.user.role` en el token | «NextAuth emite el JWT de sesión tras el login.» |
| **Postgres (`users`)** | `upsertUserFromAuth` → tabla `users` | Perfil + rol (`CLIENT` / `WORKER` / `ADMIN`) | «El rol vive en Neon; el JWT lo lleva en cada request.» |

**Flujo login:** formulario → Firebase OK → `upsertUserFromAuth` → NextAuth JWT → cookie → `/products`.

---

## 2. Proxy + `requireRole`

Dos barreras; no basta con una.

```
Request
   │
   ▼
┌─────────────────────────────────────┐
│ 1ª capa — src/proxy.ts (edge)       │
│ · Páginas: sin cookie → /login      │
│ · APIs: sin token → 401 JSON        │
│ · Inventario: rol ≠ WORKER/ADMIN    │
│   → 403 en /api/materials|products  │
└─────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────┐
│ 2ª capa — requireRole() en handler  │
│ src/lib/api-auth.ts                 │
│ · Sin sesión → 401                  │
│ · Rol no permitido → 403            │
│ Ej.: GET /api/materials →            │
│   ADMIN + WORKER                    │
└─────────────────────────────────────┘
```

**Archivos clave:** `src/proxy.ts` · `src/lib/protected-api-routes.ts` · `src/lib/api-auth.ts`

**Frase:** «El proxy corta antes de llegar al handler; `requireRole` repite el control por si alguien llama la API directamente.»

---

## 3. Flujo `/products` → API → Prisma

```
/products (página)
  └─ MaterialList + TanStack Query
       └─ useMaterialsQuery(filters)
            └─ GET /api/materials?search&categoryId…  (+ cookie sesión)
                 └─ requireRole(ADMIN, WORKER)
                      └─ materialListQuerySchema (Zod)
                           └─ db.material.findMany()  — Prisma
                                └─ Neon PostgreSQL (tabla materials)
```

**Stock por fila (paralelo):** `GET /api/materials/:id/stock` → `getMaterialStock()` en `stock-service.ts`.

**Cliente:** TanStack Query cachea; Zustand solo filtros/UI (no duplica la lista).

**URLs BD:** `DATABASE_URL` (pooler, runtime Vercel) · `DIRECT_URL` (migraciones Prisma).

**No hay Pusher hoy** — request/response; segunda pestaña no recibe push (demo 3.2).

---

## 4. Físico / reservado / disponible

| Columna UI | Origen | Cálculo |
|------------|--------|---------|
| **Físico** | `stock_movements` | Σ IN − Σ OUT + Σ ADJUST |
| **Reservado** | `order_reservations` (`active: true`) | Σ quantity |
| **Disponible** | derivado | **físico − reservado** |

**Código:** `src/lib/stock-service.ts` → `computeMaterialStockDecimal`  
**Test memoria:** físico 8, reservado 2 → disponible 6 (`stock-service.test.ts`)

**Voz alta:** «Disponible es lo que queda para nuevos pedidos; reservado ya está comprometido pero el físico no se consume hasta producción.»

**Decimal:** cantidades con `Prisma.Decimal` / `NUMERIC` en Postgres — no `float` de JS.

---

## ASCII de referencia (30 s)

```
┌──────────────┐   cookie JWT   ┌──────────────────────────┐
│ React        │ ─────────────► │ Vercel / Next.js         │
│ Query+Zustand│ ◄───────────── │ proxy → /api/materials   │
└──────────────┘   JSON         │ requireRole → Prisma     │
                                └────────────┬─────────────┘
                                             │ DATABASE_URL
                                             ▼
                                ┌──────────────────────────┐
                                │ Neon PostgreSQL          │
                                │ materials · movements ·  │
                                │ order_reservations       │
                                └──────────────────────────┘
```

---

## Frases de respaldo (si te bloqueas)

- **3 capas auth:** «Firebase autentica, NextAuth sesiona, Postgres autoriza con el rol.»
- **Proxy:** «Primera línea en el edge; sin cookie no entras ni a la página ni a la API.»
- **Sin tiempo real:** «Los datos están bien en Neon; falta push para sincronizar pestañas.»
- **Deuda products:** «La UI usa `/api/materials`; `/api/products` es legacy (DT-002).»

---

## Antes de grabar (2 min)

1. ☐ Pestaña con `/products` logueada (WORKER o ADMIN)
2. ☐ Esta chuleta + `diagrama-arquitectura.md` en el IDE
3. ☐ Saber de memoria: **disponible = físico − reservado**
4. ☐ Cronómetro: bloque arquitectura ≈ 60 s + modelo datos ≈ 45 s
