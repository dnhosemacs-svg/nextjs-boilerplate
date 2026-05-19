# Arquitectura del sistema de inventario (v1)

> Documento de diseño — Día 1. Describe la arquitectura acordada antes de implementar BD y estado cliente avanzado.

## Visión general

Sistema de inventario para el taller de carpintería. Tres capas:

1. **Navegador (React)** — UI, estado local de interfaz y caché de datos del servidor.
2. **Next.js** — App Router, Server Components (RSC), Route Handlers (`/api/*`) y middleware.
3. **PostgreSQL** — Persistencia relacional (Neon en la nube), accedida desde el servidor vía Prisma (día 2).

## Diagrama de capas (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│  NAVEGADOR (React — Client Components)                      │
│  ┌─────────────────────┐  ┌──────────────────────────────┐  │
│  │ Zustand             │  │ TanStack Query               │  │
│  │ · filtros           │  │ · productos, categorías      │  │
│  │ · búsqueda          │  │ · cache, refetch, loading    │  │
│  │ · panel activo      │  │ · mutaciones → invalidar     │  │
│  └─────────────────────┘  └──────────────────────────────┘  │
│           │                            │                     │
│           │  fetch / mutate            │                     │
└───────────┼────────────────────────────┼─────────────────────┘
            ▼                            ▼
┌─────────────────────────────────────────────────────────────┐
│  NEXT.JS (mismo despliegue — Vercel)                        │
│  ┌─────────────────────┐  ┌──────────────────────────────┐  │
│  │ RSC + layouts       │  │ Route Handlers               │  │
│  │ · páginas servidor  │  │ GET/POST /api/products       │  │
│  │ · sesión (NextAuth) │  │ GET/POST /api/categories     │  │
│  │ · middleware        │  │ · Zod + requireApiSession()  │  │
│  └─────────────────────┘  └──────────────────────────────┘  │
│                            │                                 │
│                            ▼                                 │
│                   Prisma (día 2) → src/lib/db.ts             │
└────────────────────────────┼────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  POSTGRESQL (Neon)                                          │
│  · tablas Category, Product (y relaciones)                  │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de una lectura de productos (objetivo)

1. El usuario abre `/products` (página protegida por middleware).
2. Un Client Component monta TanStack Query con clave `['products']`.
3. Query hace `GET /api/products` (cookie de sesión NextAuth).
4. El Route Handler valida sesión, consulta Prisma y devuelve JSON.
5. TanStack Query guarda el resultado; Zustand solo guarda filtros/UI (no duplica la lista en servidor).

## Por qué no un Express separado

| Criterio | Next.js único | Express + React aparte |
|----------|---------------|-------------------------|
| Despliegue | Un proyecto en Vercel (misma URL actual) | Dos servicios, CORS, dos envs |
| Auth | Middleware + `getServerSession` en RSC y APIs | Repetir sesión/JWT entre apps |
| Tipos y código | `@/lib`, Zod y Prisma compartidos | Duplicar validación y DTOs |
| Enunciado del ejercicio | Route Handlers = API REST en el mismo repo | Capa extra sin beneficio en MVP |

**Conclusión:** la API vive en `src/app/api/**/route.ts`. No se crea servidor Express.

## Autenticación (extra respecto al enunciado mínimo)

El enunciado mínimo puede asumir solo “usuario logueado”. En este proyecto:

| Pieza | Ubicación | Rol |
|-------|-----------|-----|
| **NextAuth (Auth.js)** | `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts` | Sesión JWT, proveedores |
| **Firebase Auth** | `src/lib/firebase-auth-rest.ts` (login), `src/lib/firebase-client.ts` (registro) | Credenciales email/contraseña |
| **GitHub OAuth** | Opcional vía `GITHUB_ID` / `GITHUB_SECRET` | Login social |
| **Protección** | `middleware.ts`, `src/lib/protected-api-routes.ts` | Redirect a `/login` y `401` en APIs |

**UI:** Carbon Design System en `/login` y `/register` (`@carbon/react` en `auth-login-form.tsx`). Inventario usará shadcn (día 1–2), sin mezclar Carbon en el módulo privado de productos.

Variables de entorno: ver `.env.example` y `README.md`.

## Estado actual del repo (día 1)

| Elemento | Estado |
|----------|--------|
| `npm run dev` | Script en `package.json` |
| Login + middleware | Implementado |
| Sidebar → `/products`, `/categories` | Placeholders (“API pendiente”) |
| Carbon en `/login` | `Button`, `TextInput`, `PasswordInput` de Carbon |
| Zustand / TanStack Query | **Pendiente** (tarjetas siguientes o día 2) |
| PostgreSQL / Prisma | **Pendiente día 2** |
| Pedidos (`Task`) | Cookie `taskflow_tasks` (legacy del boilerplate; no es inventario) |

Documentación relacionada:

- [Flujo público/privado](./navigation-flow.md)
- [OAuth](./seguridad/oauth.md)
- [Middleware](./seguridad/middleware.md)
- [Credenciales](./seguridad/credenciales.md)

## Pendiente día 2 — Modelo de datos

> No implementar en este doc; solo dejar escrito el contrato para el día 2.

### Entidades previstas (borrador)

**Category**

- `id` (UUID o cuid)
- `name` (string, único)
- `createdAt`, `updatedAt`

**Product**

- `id`
- `name`, `description?`, `sku?`
- `price` (decimal)
- `stock` (entero ≥ 0)
- `categoryId` → FK `Category`
- `createdAt`, `updatedAt`

### Relaciones

- Una categoría tiene muchos productos.
- Un producto pertenece a una categoría.

### Tareas día 2 (referencia)

1. Cuenta Neon + `DATABASE_URL` en `.env.local` y Vercel.
2. `prisma/schema.prisma`, migración, seed.
3. `src/lib/db.ts` (cliente Prisma singleton).
4. APIs `/api/categories`, `/api/products` con el mismo patrón que `/api/tasks`.
5. Sustituir placeholders en `(app)/products` y `(app)/categories`.

## Gate día 1 (verificación manual)

Marcar cuando todo pase:

- [ ] `npm run dev` arranca sin error en `http://localhost:3000`
- [ ] Login con email/contraseña (Firebase) llega a `/dashboard`
- [ ] Sidebar: **Productos** → `/products` muestra placeholder
- [ ] Sidebar: **Categorías** → `/categories` muestra placeholder
- [ ] `/login` sigue mostrando controles Carbon (inputs/botones IBM)
- [ ] Sin sesión, `/products` redirige a `/login`
- [ ] Este archivo existe: `docs/arquitectura.md`

## Versión

- **v1** — Día 1: arquitectura documentada; BD y Query/Zustand en implementación posterior.
