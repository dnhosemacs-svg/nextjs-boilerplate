# TaskFlow Carpintería

> Panel interno para gestionar pedidos del taller.

Aplicación web de gestión para el taller de carpintería construida con Next.js App Router. Incluye **inventario** (categorías y productos en PostgreSQL/Neon), CRUD de pedidos, autenticación con NextAuth (Firebase + GitHub OAuth opcional), protección de rutas con middleware y panel de estadísticas.


| Despliegue | URL                                                     |
| ---------- | ------------------------------------------------------- |
| Vercel     | `https://nextjs-boilerplate-sigma-eosin-30.vercel.app/` |


---

## Características

- CRUD completo de pedidos (`/api/tasks` y `/api/tasks/:id`).
- Inicio de sesión con correo electrónico/contraseña (Firebase REST en servidor) y GitHub OAuth si está configurado.
- Registro de cuentas en `/register` (Firebase Auth en el navegador).
- Rutas protegidas para trabajo interno (`/dashboard`, `/tasks/*`, `/stats`).
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

- [Arquitectura](docs/arquitectura.md)
- [API REST inventario](docs/api.md)

---

## Tecnologías


| Capa                 | Uso                                                  |
| -------------------- | ---------------------------------------------------- |
| Next.js (App Router) | Rutas, renderizado servidor/cliente y Route Handlers |
| NextAuth             | Sesión JWT, proveedores credentials y GitHub         |
| Firebase Auth        | Registro en cliente; login correo/contraseña en servidor |
| TypeScript           | Tipado estático                                      |
| React                | Componentes y estado de UI                           |
| Zod                  | Validación de payloads en API                        |
| Prisma + PostgreSQL  | Inventario (Neon en producción)                      |
| TanStack Query       | Caché y mutaciones del inventario en cliente         |
| Zustand              | Filtros y UI del panel privado                       |
| CSS global           | Estilos de aplicación                                |


---

## Estructura del proyecto

```text
nextjs-boilerplate/
├── middleware.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── docs/
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

- [Arquitectura del inventario (v1)](docs/arquitectura.md)
- [Gestión de estado (Query + Zustand)](docs/state-management.md)
- [Referencia API REST](docs/api.md)
- [OAuth 2.0 / GitHub](docs/seguridad/oauth.md)
- [Middleware y protección de rutas](docs/seguridad/middleware.md)
- [Credenciales y contraseñas](docs/seguridad/credenciales.md)

---

## Descargar y ejecutar

```bash
git clone https://github.com/dnhosemacs-svg/nextjs-boilerplate
cd nextjs-boilerplate
npm install
cp .env.example .env.local   # edita .env.local con tus valores
npm run dev
```

Aplicación disponible en [http://localhost:3000](http://localhost:3000).

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
- `npm run lint`: análisis estático con ESLint.

---

## Rutas de la app

- `/`: inicio público del proyecto.
- `/login`: inicio de sesión (correo/contraseña y GitHub si está configurado).
- `/register`: crear cuenta con Firebase.
- `/dashboard`: panel privado principal (protegida).
- `/tasks/new`: crear pedido (protegida).
- `/tasks/[id]`: ver/editar/eliminar pedido (protegida).
- `/stats`: resumen operativo (protegida).
- `/products`: inventario de productos (protegida).
- `/categories`: gestión de categorías (protegida).

Rutas auxiliares:

- `src/app/loading.tsx`
- `src/app/not-found.tsx`

---

## API

### Tasks

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
4. Comprueba que sin cookie (o con sesión caducada) las APIs sensibles responden **401** JSON (`{"error":"No autenticado"}`). Rutas relevantes: `src/app/api/tasks/*`, `src/app/api/products/*`, `src/app/api/categories/*`.

**Verificación rápida de códigos** (con sesión válida salvo donde se indica):

| Código | Cómo obtenerlo (orientativo) |
| ------ | ---------------------------- |
| **401** | Cualquier `GET`/`POST`/… a `/api/tasks`, `/api/products` o `/api/categories` **sin** header `Cookie`. |
| **200** / **201** | Por ejemplo `GET /api/categories` o `POST /api/categories` con JSON válido. |
| **400** | Cuerpo o query inválidos: p. ej. `POST /api/categories` con `{"name":""}`, o `GET /api/products?sortBy=noValido`. |
| **404** | `PATCH` o `DELETE` en `/api/categories/:id` o `/api/products/:id` con un **id que no exista** en la base de datos. |
| **409** | `POST /api/categories` con un **nombre ya usado**; o `DELETE /api/categories/:id` cuando esa categoría **tiene productos** (crear categoría → `POST /api/products` con ese `categoryId` → luego `DELETE` de la categoría). |

> **Nota:** No versiones en git valores reales de cookies ni entornos exportados con secretos; usa variables locales o placeholders en colecciones compartidas.

**Colección lista para importar:** [tools/postman/](tools/postman/) — `carpinteria-api.postman_collection.json` y `carpinteria-api.postman_environment.json` (Postman o Thunder Client). Tras importar, rellena la variable `cookie` del entorno y sigue [tools/postman/README.md](tools/postman/README.md). Checklist de verificación manual: [tools/postman/CHECKLIST.md](tools/postman/CHECKLIST.md).

---

## Modelo de datos

### Inventario (PostgreSQL)

`Category` y `Product` en `prisma/schema.prisma`. Relación uno-a-muchos; `price` como `Decimal(10, 2)`. Detalle: [docs/arquitectura.md](docs/arquitectura.md).

### Pedidos (legacy)

`Task` (`src/types/task.ts`):

- `id: string`
- `title: string`
- `description?: string`
- `status: "pending" | "in_progress" | "done"`
- `createdAt: string` (ISO)
- `updatedAt: string` (ISO)

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

- **Inventario:** persistido en PostgreSQL (Neon); requiere `DATABASE_URL` y `DIRECT_URL` configuradas.
- **Pedidos (`Task`):** siguen en cookie por sesión (legacy del boilerplate).
- Usuarios gestionados en Firebase; no hay panel de administración de usuarios en la app.
