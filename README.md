# TaskFlow Carpintería

[![CI](https://github.com/dnhosemacs-svg/nextjs-boilerplate/actions/workflows/ci.yml/badge.svg)](https://github.com/dnhosemacs-svg/nextjs-boilerplate/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/coverage-86%25%20lines-brightgreen)](https://github.com/dnhosemacs-svg/nextjs-boilerplate/actions/workflows/ci.yml#:~:text=Test%20with%20coverage)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

**Panel interno full-stack para un taller de carpintería.** Un solo despliegue en Vercel con tres módulos conectados:

- **Inventario** — categorías, materiales, stock físico/reservado/disponible y movimientos en PostgreSQL (Neon).
- **Pedidos** — flujo de estados (`DRAFT` → `DELIVERED`), reservas de material al aprobar y consumo en producción.
- **Auth** — sesión JWT (NextAuth), login correo/contraseña vía Firebase REST, GitHub OAuth opcional y roles `CLIENT` / `WORKER` / `ADMIN`.

La API vive en Route Handlers (`src/app/api/**`); no hay servidor Express aparte. Middleware y `requireRole` protegen páginas y endpoints.

---

## Demo

| Recurso | Enlace |
| ------- | ------ |
| **App (Vercel)** | [nextjs-boilerplate-sigma-eosin-30.vercel.app](https://nextjs-boilerplate-sigma-eosin-30.vercel.app/) |
| **Inventario en vivo** | [/products](https://nextjs-boilerplate-sigma-eosin-30.vercel.app/products) |
| **Vídeo demo (Loom)** | [Walkthrough inventario (~5 min)](https://www.loom.com/share/b66ecf642eba49c6afab4dc28ffa308d) |

> **Nota:** El vídeo Loom cubre **solo el módulo de inventario** (`/products`, categorías y stock). Pedidos, panel por rol y administración están en este README y en la app desplegada, pero no forman parte de la grabación.

**Badges:** CI enlaza al workflow real en GitHub Actions. Cobertura medida en CI con Vitest (v8) sobre `src/lib` + APIs de inventario; umbral ≥ 80 % en líneas y funciones ([`vitest.config.ts`](vitest.config.ts)). Codecov es opcional (tarjeta 4.6); el badge de cobertura apunta al job *Test with coverage* del mismo workflow.

---

## Tecnologías por módulo

| Módulo | Capa | Tecnología | Uso en el proyecto |
| ------ | ---- | ---------- | ------------------- |
| **Inventario** | Datos | Prisma + PostgreSQL (Neon) | Modelos `Category`, `Material`, `StockMovement`; `DATABASE_URL` (pooler) + `DIRECT_URL` (migraciones) |
| | API | Next.js Route Handlers + Zod | `/api/categories`, `/api/materials`, stock y movimientos |
| | Cliente | TanStack Query + Zustand | Caché de materiales; filtros y UI en `ui-store` |
| | UI | shadcn / React 19 | `/products`, `/categories` |
| **Pedidos** | Datos | Prisma | `Order`, `OrderMaterialLine`, `OrderReservation`, `OrderStatusEvent` |
| | API | Route Handlers + Zod | `/api/orders`, transiciones de estado, consumo y movimientos por pedido |
| | Dominio | `stock-service`, reservas | Físico / reservado / disponible; aprobar pedido reserva stock |
| | UI | React (panel taller) | `/orders`, `/my-orders`, `/dashboard` por rol |
| **Auth** | Sesión | NextAuth (Auth.js) | JWT en cookie; `src/lib/auth.ts` |
| | Credenciales | Firebase Auth REST | Login servidor (`firebase-auth-rest.ts`); registro en cliente (`/register`) |
| | Social | GitHub OAuth | Opcional (`GITHUB_ID` / `GITHUB_SECRET`) |
| | Protección | `middleware.ts`, `requireRole` | Redirect a `/login`; `401`/`403` en APIs |
| | Roles | Postgres `users.role` | `CLIENT`, `WORKER`, `ADMIN` en sesión |
| **Plataforma** | Runtime | Next.js 16 App Router | RSC + Client Components, despliegue serverless en Vercel |
| | Calidad | ESLint, TypeScript, Vitest | CI: lint → `tsc` → `test:coverage` → `build` |
| | Observabilidad | Sentry (`@sentry/nextjs`) | Errores en producción (cuando está configurado) |

---

## Decisiones técnicas

| Decisión | Elección | Alternativa | Motivo |
| -------- | -------- | ----------- | ------ |
| Arquitectura API | Next.js Route Handlers en el mismo repo | Express + SPA aparte | Un deploy en Vercel, tipos y Zod compartidos, middleware unificado ([`docs/arquitectura.md`](docs/arquitectura.md), [diagrama](docs/arquitectura/diagrama.png)) |
| Base de datos | Neon PostgreSQL + Prisma 7 | SQLite / ORM distinto | Relaciones pedidos–stock; pooler para serverless (`DATABASE_URL` vs `DIRECT_URL`) |
| Estado en cliente (inventario) | TanStack Query + Zustand | Solo `useState` / Redux | Query = datos del servidor; Zustand = filtros sin duplicar listas ([`docs/state-management.md`](docs/state-management.md)) |
| Autenticación | NextAuth JWT + Firebase + Postgres | Solo Firebase en cliente | Sesión en SSR y APIs; rol de negocio en tabla `users` |
| Stock | Libro mayor (`StockMovement`) + reservas | Campo `stock` único | Trazabilidad y pedidos que reservan material sin doble conteo |
| Tiempo real | **No implementado** | Pusher / WebSockets | Flujo request–response; otra pestaña ve cambios tras refetch (F5). Pusher figura solo como **roadmap** en diagramas, no en dependencias ni env |
| Duplicado `/api/products` | Mantener ambas rutas (deuda) | Borrar legacy ya | UI activa usa `/api/materials`; consolidación aplazada ([`docs/auditoria/deuda-tecnica.md`](docs/auditoria/deuda-tecnica.md)) |
| Demo en vídeo | Solo inventario | Grabar pedidos y admin | Alcance del Loom ≤ 5 min; plataforma completa documentada aquí |

---

## Características

- Pedidos en PostgreSQL con flujo de estados, reservas de stock y roles (`/api/orders`, `/orders`, `/my-orders`).
- Inventario de materiales y categorías (`/api/materials`, `/products`, `/categories`).
- Inicio de sesión con correo electrónico/contraseña (Firebase REST en servidor) y GitHub OAuth si está configurado.
- Registro de cuentas en `/register` (Firebase Auth en el navegador).
- Rutas protegidas por rol (`CLIENT`, `WORKER`, `ADMIN`) con middleware y `requireRole` en API.
- Redirección post-login segura con `next` y `callbackUrl`.
- UI con Server Components + Client Components donde hay estado.

---

## Inventario (PostgreSQL + Neon)

Módulo de categorías y productos persistidos en **PostgreSQL** (recomendado **Neon** en la nube):

- **UI:** `/products`, `/categories` (rutas privadas).
- **API:** `/api/categories`, `/api/products`, ajuste de stock en `PATCH /api/products/:id/stock`.
- **ORM:** Prisma (`prisma/schema.prisma`) — modelos `Category` y `Product`.
- **Estado en cliente:** TanStack Query (datos del servidor) + Zustand (filtros y sidebar). Ver [docs/state-management.md](docs/state-management.md).

Documentación técnica:

- [Arquitectura](docs/arquitectura.md) — [diagrama PNG](docs/arquitectura/diagrama.png)
- [API REST inventario](docs/api.md)

---

## Pedidos y roles

Pedidos persistidos en PostgreSQL (`Order` en `prisma/schema.prisma`). Tres roles en `users.role` (NextAuth → `session.user.role`):

| Rol | UI principal | Pedidos |
| --- | ------------ | ------- |
| **CLIENT** | `/my-orders`, `/orders/new` | Crear y editar **propios** en `DRAFT`; enviar a `PENDING`; cancelar borrador/enviado. No ve pedidos ajenos (**403** en API). |
| **WORKER** | `/orders`, `/dashboard`, materiales | Flujo de taller: líneas, aprobar (reserva stock), producción, consumo real, entrega. |
| **ADMIN** | Igual que worker + `/admin/users` | Gestión de usuarios y mismo acceso operativo a pedidos. |

**Flujo de estados:**

```text
DRAFT → PENDING → APPROVED → IN_PRODUCTION → READY → DELIVERED
         (cancelar desde varios estados → CANCELLED, libera reservas)
```

Documentación:

- [Flujo de estados y transiciones](docs/pedidos/flujo-estados.md)
- [Matriz de permisos](docs/seguridad/roles-permisos.md)
- [Datos para ML / preparación IA](docs/pedidos/datos-ml.md)
- [Fase 2 IA — BOM desde histórico](docs/pedidos/fase-2-ia.md)
- [QA manual pedidos (tarjeta 4.4)](tools/postman/CHECKLIST-ORDERS-QA-4.4.md)

**API principal:** `GET/POST /api/orders`, `GET/PATCH /api/orders/:id`, `PATCH /api/orders/:id/status`, `PUT /api/orders/:id/materials`, `POST /api/orders/:id/consume`, `GET /api/orders/:id/movements` (taller).

> **Legacy:** `/tasks/*` y `/api/tasks` siguen en el repo como demo en cookie; usar **pedidos** (`/orders`) para el taller.

---

## Estructura del proyecto

```text
nextjs-boilerplate/
├── middleware.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── docs/
│   ├── arquitectura/
│   │   ├── diagrama.png
│   │   └── diagrama.mmd
│   ├── arquitectura.md
│   ├── api.md
│   └── state-management.md
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── categories/
│   │   │   ├── products/
│   │   │   └── tasks/
│   │   ├── (app)/          # Rutas privadas (dashboard, products, categories, tasks, stats)
│   │   ├── (public)/       # login, register, inicio
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth-login-form.tsx
│   │   ├── auth-register-form.tsx
│   │   ├── inventory/
│   │   └── tasks/
│   ├── hooks/inventory/
│   ├── stores/
│   └── lib/
│       ├── auth.ts
│       ├── db.ts
│       ├── firebase-auth-rest.ts
│       ├── firebase-client.ts
│       ├── validators/
│       └── tasks-cookie-store.ts
└── README.md
```

Copia `.env.example` a `.env.local` y rellena las variables antes de desarrollar.

Documentación:

- [Arquitectura del inventario (v1)](docs/arquitectura.md) — [diagrama de capas](docs/arquitectura/diagrama.png)
- [Gestión de estado (Query + Zustand)](docs/state-management.md)
- [Referencia API REST](docs/api.md)
- [OAuth 2.0 / GitHub](docs/seguridad/oauth.md)
- [Middleware y protección de rutas](docs/seguridad/middleware.md)
- [Credenciales y contraseñas](docs/seguridad/credenciales.md)
- [Flujo de pedidos](docs/pedidos/flujo-estados.md)
- [Plantillas BOM manuales](docs/bom-templates.md)
- [QA pedidos 4.4](tools/postman/CHECKLIST-ORDERS-QA-4.4.md)

---

## Instalación local (clone limpio)

Guía verificada en **Windows** con Node **22**, tras `git clone` en carpeta nueva (mismos pasos que ejecuta CI salvo base de datos real).

### Requisitos

- **Node.js 22** (la CI usa `node-version: 22`)
- Cuenta **Neon** (PostgreSQL) — `DATABASE_URL` + `DIRECT_URL`
- Proyecto **Firebase** — `FIREBASE_API_KEY` y `NEXT_PUBLIC_FIREBASE_*` si usas `/register`
- `NEXTAUTH_SECRET` — p. ej. `openssl rand -base64 32`

### Pasos

```bash
git clone https://github.com/dnhosemacs-svg/nextjs-boilerplate.git
cd nextjs-boilerplate
npm ci
cp .env.example .env.local
```

Edita `.env.local` con tus valores (mínimo: `NEXTAUTH_SECRET`, `NEXTAUTH_URL=http://localhost:3000`, `FIREBASE_API_KEY`, `DATABASE_URL`, `DIRECT_URL`). Detalle en [Configuración](#configuración).

Primera vez con base de datos vacía:

```bash
npx prisma migrate deploy
npx prisma db seed   # opcional: datos de demo
npm run dev
```

Aplicación en [http://localhost:3000](http://localhost:3000). Inicia sesión en `/login` (usuario existente en Firebase/Postgres o registro en `/register` si está habilitado).

### Verificación (misma batería que CI)

Con `.env.local` completo:

```bash
npm run lint
npx tsc --noEmit
npm run test:coverage
npm run build
```

| Comando | Resultado esperado (jun 2026) |
| ------- | ------------------------------ |
| `npm run lint` | 0 errores |
| `npx tsc --noEmit` | 0 errores |
| `npm run test:coverage` | 58 tests OK; ≥ 80 % líneas/funciones en paths de inventario |
| `npm run build` | Build de producción OK (`assertServerEnv` exige secretos en `NODE_ENV=production`) |

Sin base de datos ni Firebase configurados, `npm run dev` fallará al acceder a rutas que usan Prisma; los cuatro comandos de verificación sí pasan con variables dummy como en [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

---

## Configuración

Crea `.env.local` en la raíz del proyecto (no se sube a git). Plantilla: [.env.example](.env.example).

### Variables de entorno

| Variable | Local | Producción | Descripción |
| -------- | ----- | ------------ | ----------- |
| `NEXTAUTH_SECRET` | Recomendado | **Obligatorio** | Firma del JWT de Auth.js. Alias: `AUTH_SECRET`. Sin valor en dev se usa un secreto temporal (ver consola). |
| `NEXTAUTH_URL` | `http://localhost:3000` | **Recomendado** | URL pública de la app (callbacks OAuth y cookies). |
| `VERCEL_URL` | — | Automático en Vercel | Alternativa de URL canónica en build si no defines `NEXTAUTH_URL`. |
| `GITHUB_ID` / `GITHUB_SECRET` | Opcional | Opcional (par completo) | OAuth GitHub; ambas o ninguna ([server-env.ts](src/lib/server-env.ts)). |
| `FIREBASE_API_KEY` | Recomendado | **Obligatorio** | Clave web Firebase; login correo/contraseña en servidor (sin `NEXT_PUBLIC_`). |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Si usas registro | Si usas registro | Misma clave web; restringir por dominio en Google Cloud. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Si usas registro | Si usas registro | `authDomain` de firebaseConfig. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Si usas registro | Si usas registro | `projectId` de firebaseConfig. |
| `DATABASE_URL` | **Obligatorio** (inventario) | **Obligatorio** | URL Neon con **connection pooling ON** — runtime de la app (`src/lib/db.ts`). |
| `DIRECT_URL` | **Obligatorio** (migraciones) | **Obligatorio** | URL Neon con **pooling OFF** — Prisma CLI (`migrate`, `db push`, seed). |

### Local vs producción

| Paso | Desarrollo (`npm run dev`) | Producción (Vercel) |
| ---- | -------------------------- | ------------------- |
| Copiar plantilla | `cp .env.example .env.local` | Variables en Project Settings → Environment Variables |
| Secreto sesión | `NEXTAUTH_SECRET` (openssl) | Mismo valor seguro en Preview y Production |
| URL app | `NEXTAUTH_URL=http://localhost:3000` | `NEXTAUTH_URL=https://tu-dominio.vercel.app` |
| Firebase login | `FIREBASE_API_KEY` + `NEXT_PUBLIC_*` para `/register` | Igual; correo/contraseña habilitado en Firebase Console |
| GitHub OAuth | Callback `http://localhost:3000/api/auth/callback/github` | Callback `https://tu-dominio/api/auth/callback/github` |
| Validación build | Relajada en dev | [src/lib/server-env.ts](src/lib/server-env.ts) falla el build si falta secreto, URL, Firebase o par GitHub incompleto |
| Base de datos | `DATABASE_URL` + `DIRECT_URL` en `.env.local` | Mismas variables en Vercel; `npx prisma migrate deploy` en producción |

### PostgreSQL en Neon

1. Crea un proyecto en [Neon](https://neon.tech).
2. En **Connect** copia dos URLs del mismo branch:
   - **Pooling ON** → `DATABASE_URL` (la app en Vercel y `npm run dev`).
   - **Pooling OFF** → `DIRECT_URL` (solo CLI Prisma; no uses el pooler para migrar).
3. En local, en `.env.local`:

```env
DATABASE_URL=postgresql://...@...-pooler....neon.tech/...?sslmode=require
DIRECT_URL=postgresql://...@....neon.tech/...?sslmode=require
```

4. Primera vez en el repo:

```bash
npx prisma migrate deploy
npx prisma db seed   # opcional: datos de demo
```

5. En **Vercel** → Project → Settings → Environment Variables: añade `DATABASE_URL` y `DIRECT_URL` en **Preview** y **Production**, luego **Redeploy**.

> **Importante:** `DATABASE_URL` = pooling para serverless; `DIRECT_URL` = conexión directa para migraciones. Detalle en [docs/arquitectura.md](docs/arquitectura.md#database_url-pooled-vs-direct_url-migraciones).

### Checklist: secretos y despliegue

1. Generar secreto: `openssl rand -base64 32` → `NEXTAUTH_SECRET`.
2. Firebase: Authentication → Sign-in method → correo/contraseña activado.
3. GitHub OAuth (opcional): OAuth App con callback `/api/auth/callback/github` en local y producción.
4. Vercel: mismas variables en Preview y Production; redeploy tras cambios.
5. Neon: `DATABASE_URL` (pool ON) y `DIRECT_URL` (pool OFF) en local y Vercel.
6. Tras cambiar BD: `npx prisma migrate deploy` (producción) y redeploy.

---

## Scripts

- `npm run dev`: servidor de desarrollo.
- `npm run build`: build de producción.
- `npm run start`: ejecutar build de producción.
- `npm run lint` / `npm run lint:fix`: análisis estático con ESLint.
- `npm run test` / `npm run test:coverage`: tests Vitest (cobertura en APIs y `src/lib` de inventario).

---

## Rutas de la app

- `/`: inicio público del proyecto.
- `/login`: inicio de sesión (correo/contraseña y GitHub si está configurado).
- `/register`: crear cuenta con Firebase.
- `/dashboard`: panel privado principal (protegida).
- `/orders`, `/orders/new`, `/orders/[id]`: pedidos del taller (WORKER / ADMIN).
- `/my-orders`: pedidos del cliente (CLIENT).
- `/stats`: resumen operativo (protegida).
- `/products`: materiales / inventario (WORKER / ADMIN).
- `/categories`: categorías de materiales (WORKER / ADMIN).
- `/admin/users`: gestión de usuarios (ADMIN).
- `/tasks/new`, `/tasks/[id]`: demo legacy en cookie (sustituido por `/orders`).

Rutas auxiliares:

- `src/app/loading.tsx`
- `src/app/not-found.tsx`

---

## API

### Pedidos (`/api/orders`)

Requieren sesión. Resumen; detalle en [flujo-estados](docs/pedidos/flujo-estados.md).

| Método | Ruta | Quién (orientativo) |
| ------ | ---- | ------------------- |
| `GET` / `POST` | `/api/orders` | Todos los roles; CLIENT solo ve/crea propios |
| `GET` / `PATCH` | `/api/orders/:id` | CLIENT solo propio (**403** si ajeno); taller todos |
| `PATCH` | `/api/orders/:id/status` | Transiciones según rol (aprobar/cancelar → reservas) |
| `PUT` | `/api/orders/:id/materials` | WORKER / ADMIN |
| `POST` | `/api/orders/:id/consume` | WORKER / ADMIN (`IN_PRODUCTION`) |
| `GET` | `/api/orders/:id/movements` | WORKER / ADMIN |

Códigos habituales: **401** sin cookie, **403** sin permiso o pedido ajeno (CLIENT), **404** id inexistente, **400** transición o validación inválida.

### Tasks (legacy)

- `GET /api/tasks`
  - **200**: devuelve `Task[]`.
  - **401**: no autenticado.
- `POST /api/tasks`
  - **201**: devuelve `Task` creado.
  - **400**: cuerpo inválido o error de validación.
  - **401**: no autenticado.
- `GET /api/tasks/:id`
  - **200**: devuelve `Task`.
  - **404**: no encontrado.
  - **401**: no autenticado.
- `PUT /api/tasks/:id`
  - **200**: devuelve `Task` actualizado.
  - **400**: cuerpo inválido o error de validación.
  - **404**: no encontrado.
  - **401**: no autenticado.
- `DELETE /api/tasks/:id`
  - **200**: devuelve `Task` eliminado.
  - **404**: no encontrado.
  - **401**: no autenticado.

### Auth (NextAuth)

Ruta catch-all: `src/app/api/auth/[...nextauth]/route.ts`. No hay `POST /api/auth/login` custom.

- `GET/POST /api/auth/*` — rutas internas de NextAuth (sesión, callback credentials, callback github, signout, etc.).
- `GET /api/auth/session` — sesión actual.

El login desde la UI usa `signIn()` del cliente (`redirect: false` para credentials).

### Probar APIs autenticadas (Thunder Client / Postman)

1. Arranca `npm run dev` e inicia sesión en `/login` con un usuario válido (Firebase + credenciales del proyecto).
2. En el navegador, DevTools → **Cookies** de `http://localhost:3000` y copia el valor de la cookie de sesión de NextAuth. En local suele llamarse **`next-auth.session-token`** (en HTTPS/producción el nombre puede incluir prefijos `__Secure-` / `__Host-`).
3. En **Thunder Client** o **Postman**, define `baseUrl` como `http://localhost:3000` y en cada petición protegida envía el header **`Cookie`** con ese par nombre/valor, por ejemplo: `next-auth.session-token=<valor copiado>`. También puedes guardar la cadena completa en una variable del entorno/colección.
4. Comprueba que sin cookie (o con sesión caducada) las APIs sensibles responden **401** JSON (`{"error":"No autenticado"}`). Rutas relevantes: `/api/orders/*`, `/api/materials/*`, `/api/categories/*`, `/api/tasks/*` (legacy).

**Verificación rápida de códigos** (con sesión válida salvo donde se indica):

| Código | Cómo obtenerlo (orientativo) |
| ------ | ---------------------------- |
| **401** | Cualquier `GET`/`POST`/… a `/api/tasks`, `/api/products` o `/api/categories` **sin** header `Cookie`. |
| **200** / **201** | Por ejemplo `GET /api/categories` o `POST /api/categories` con JSON válido. |
| **400** | Cuerpo o query inválidos: p. ej. `POST /api/categories` con `{"name":""}`, o `GET /api/products?sortBy=noValido`. |
| **404** | `PATCH` o `DELETE` en `/api/categories/:id` o `/api/products/:id` con un **id que no exista** en la base de datos. |
| **409** | `POST /api/categories` con un **nombre ya usado**; o `DELETE /api/categories/:id` cuando esa categoría **tiene productos** (crear categoría → `POST /api/products` con ese `categoryId` → luego `DELETE` de la categoría). |

> **Nota:** No versiones en git valores reales de cookies ni entornos exportados con secretos; usa variables locales o placeholders en colecciones compartidas.

**Colección lista para importar:** [tools/postman/](tools/postman/) — `carpinteria-api.postman_collection.json` y `carpinteria-api.postman_environment.json` (Postman o Thunder Client). Tras importar, rellena la variable `cookie` del entorno y sigue [tools/postman/README.md](tools/postman/README.md). Checklists: [inventario](tools/postman/CHECKLIST.md), [pedidos QA 4.4](tools/postman/CHECKLIST-ORDERS-QA-4.4.md).

---

## Modelo de datos

### Inventario (PostgreSQL)

`Category` y `Product` en `prisma/schema.prisma`. Relación uno-a-muchos; `price` como `Decimal(10, 2)`. Detalle: [docs/arquitectura.md](docs/arquitectura.md).

### Pedidos (PostgreSQL)

`Order`, `OrderMaterialLine`, `OrderReservation`, `OrderStatusEvent` en `prisma/schema.prisma`.

- Estados: `DRAFT`, `PENDING`, `APPROVED`, `IN_PRODUCTION`, `READY`, `DELIVERED`, `CANCELLED`
- Campos clave: `furnitureType`, `parameters` (JSON), `clientId`, líneas con `plannedQty` / `actualQty`
- Historial de estados en `order_status_events` (ML / trazabilidad)

### Tasks (legacy, cookie)

`Task` en `src/types/task.ts` — demo antigua; no usar para el taller.

---

## Autenticación (Auth.js + Firebase + OAuth)

Stack:

- **Auth.js (NextAuth)**: sesión JWT en cookie, proveedores en [src/lib/auth.ts](src/lib/auth.ts), handler en `src/app/api/auth/[...nextauth]/route.ts`.
- **Firebase Auth**: registro en cliente (`/register`); validación de correo/contraseña en servidor vía REST (`signInWithPassword` en [src/lib/firebase-auth-rest.ts](src/lib/firebase-auth-rest.ts)).
- **GitHub OAuth** (opcional): botón en `/login` si `GITHUB_ID` y `GITHUB_SECRET` están definidos.

Rutas de autenticación:

| Ruta | Acceso | Comportamiento |
| ---- | ------ | -------------- |
| `/login` | Pública | Correo/contraseña (`signIn("credentials", { redirect: false })`) y GitHub si está configurado. |
| `/register` | Pública | Alta con Firebase SDK; tras crear cuenta, login en `/login?registered=1`. |
| `/dashboard` | Privada | Panel principal; requiere sesión (middleware). |

Flujo resumido:

1. **Credentials**: formulario → Auth.js → Firebase REST en servidor → JWT de sesión → redirect a `callbackUrl` / `next` seguro o `/dashboard`.
2. **GitHub**: `signIn("github")` → GitHub → `/api/auth/callback/github` → sesión Auth.js → mismo destino post-login.
3. **Protección**: [middleware.ts](middleware.ts) redirige páginas sin sesión a `/login`; APIs `/api/tasks` devuelven `401` JSON.

Detalle: [docs/seguridad/oauth.md](docs/seguridad/oauth.md), [docs/seguridad/middleware.md](docs/seguridad/middleware.md), [docs/seguridad/credenciales.md](docs/seguridad/credenciales.md).

---

## Verificación del flujo auth

### Automática

```bash
npm run verify:auth
```

Comprueba que el login use `signIn("credentials", { redirect: false })`, que no exista `POST /api/auth/login` custom ni `document.cookie` manual en módulos de auth, y que los redirects/errores sigan el contrato del proyecto.

Después: `npm run lint` y `npm run build`.

### Manual (checklist rápido)

1. **Sin sesión**: abrir `/dashboard` → debe ir a `/login` con `callbackUrl` (y a menudo `next`) apuntando a `/dashboard`.
2. **Registro**: en `/register` crear cuenta → mensaje en `/login?registered=1` → login con esas credenciales → llegar a `/dashboard`.
3. **Credenciales erróneas**: contraseña incorrecta → «Credenciales inválidas.» (sin filtrar si el correo existe).
4. **API protegida**: `GET /api/tasks` sin cookie de sesión → `401` (p. ej. pestaña anónima o `curl`).
5. **Deep link**: sin sesión, `/tasks/new` → login → tras entrar, volver a `/tasks/new`.
6. **OAuth** (si GitHub configurado): «Continuar con GitHub» → consentimiento → vuelta autenticado a destino válido.
7. **Sesión activa**: con sesión, visitar `/login` o `/register` → redirección a `/dashboard` (o `callbackUrl` válido).

---

## Limitaciones conocidas

- **Inventario y pedidos:** PostgreSQL (Neon); requiere `DATABASE_URL` y `DIRECT_URL`.
- **Sin tiempo real:** no hay Pusher ni WebSockets; los clientes sincronizan con refetch manual (p. ej. F5). Los datos en Neon son consistentes; falta push a otras pestañas.
- **Tasks legacy:** `/api/tasks` en cookie; la operativa del taller usa `/api/orders`.
- **IA / BOM automático:** no desplegado (v1 = plantillas manuales; roadmap en [fase-2-ia](docs/pedidos/fase-2-ia.md)).
- Panel de usuarios en `/admin/users` requiere Firebase Admin configurado en servidor.
- **Codecov:** cobertura en CI vía Vitest; badge estático en README hasta conectar Codecov (tarjeta 4.6 opcional).
