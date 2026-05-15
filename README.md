# TaskFlow Carpinteria

> Panel interno para gestionar pedidos del taller.

Aplicacion web de gestion de pedidos de carpinteria construida con Next.js App Router. Incluye CRUD de pedidos, autenticacion con NextAuth (Firebase + GitHub OAuth opcional), proteccion de rutas con middleware y panel de estadisticas.


| Despliegue | URL                                                     |
| ---------- | ------------------------------------------------------- |
| Vercel     | `https://nextjs-boilerplate-sigma-eosin-30.vercel.app/` |


---

## Caracteristicas

- CRUD completo de pedidos (`/api/tasks` y `/api/tasks/:id`).
- Login con email/contraseña (Firebase REST en servidor) y GitHub OAuth si esta configurado.
- Registro de cuentas en `/register` (Firebase Auth en el navegador).
- Rutas protegidas para trabajo interno (`/dashboard`, `/tasks/*`, `/stats`).
- Redireccion post-login segura con `next` y `callbackUrl`.
- UI con Server Components + Client Components donde hay estado.

---

## Tecnologias


| Capa                 | Uso                                                  |
| -------------------- | ---------------------------------------------------- |
| Next.js (App Router) | Rutas, renderizado servidor/cliente y Route Handlers |
| NextAuth             | Sesion JWT, proveedores credentials y GitHub         |
| Firebase Auth        | Registro en cliente; login email/password en servidor |
| TypeScript           | Tipado estatico                                      |
| React                | Componentes y estado de UI                           |
| Zod                  | Validacion de payloads en API                        |
| CSS global           | Estilos de aplicacion                                |


---

## Estructura del proyecto

```text
nextjs-boilerplate/
├── middleware.ts
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   └── tasks/
│   │   │       ├── route.ts
│   │   │       └── [id]/route.ts
│   │   ├── (app)/          # Rutas privadas (dashboard, tasks, stats)
│   │   ├── (public)/       # login, register, inicio
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth-login-form.tsx
│   │   ├── auth-register-form.tsx
│   │   └── tasks/
│   └── lib/
│       ├── auth.ts
│       ├── firebase-auth-rest.ts
│       ├── firebase-client.ts
│       ├── safe-redirect.ts
│       ├── credentials-sign-in-errors.ts
│       ├── server-env.ts
│       └── tasks-cookie-store.ts
└── README.md
```

Copia `.env.example` a `.env.local` y rellena las variables antes de desarrollar.

Documentación de seguridad (entregable):

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

Aplicacion disponible en [http://localhost:3000](http://localhost:3000).

---

## Configuracion

Crea `.env.local` en la raiz del proyecto (no se sube a git). Plantilla: [.env.example](.env.example).

### Variables de entorno

| Variable | Local | Produccion | Descripcion |
| -------- | ----- | ------------ | ----------- |
| `NEXTAUTH_SECRET` | Recomendado | **Obligatorio** | Firma del JWT de Auth.js. Alias: `AUTH_SECRET`. Sin valor en dev se usa un secreto temporal (ver consola). |
| `NEXTAUTH_URL` | `http://localhost:3000` | **Recomendado** | URL publica de la app (callbacks OAuth y cookies). |
| `VERCEL_URL` | — | Automatico en Vercel | Alternativa de URL canonica en build si no defines `NEXTAUTH_URL`. |
| `GITHUB_ID` / `GITHUB_SECRET` | Opcional | Opcional (par completo) | OAuth GitHub; ambas o ninguna ([server-env.ts](src/lib/server-env.ts)). |
| `FIREBASE_API_KEY` | Recomendado | **Obligatorio** | Clave web Firebase; login email/password en servidor (sin `NEXT_PUBLIC_`). |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Si usas registro | Si usas registro | Misma clave web; restringir por dominio en Google Cloud. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Si usas registro | Si usas registro | `authDomain` de firebaseConfig. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Si usas registro | Si usas registro | `projectId` de firebaseConfig. |

### Local vs produccion

| Paso | Desarrollo (`npm run dev`) | Produccion (Vercel) |
| ---- | -------------------------- | ------------------- |
| Copiar plantilla | `cp .env.example .env.local` | Variables en Project Settings → Environment Variables |
| Secreto sesion | `NEXTAUTH_SECRET` (openssl) | Mismo valor seguro en Preview y Production |
| URL app | `NEXTAUTH_URL=http://localhost:3000` | `NEXTAUTH_URL=https://tu-dominio.vercel.app` |
| Firebase login | `FIREBASE_API_KEY` + `NEXT_PUBLIC_*` para `/register` | Igual; Email/Password habilitado en Firebase Console |
| GitHub OAuth | Callback `http://localhost:3000/api/auth/callback/github` | Callback `https://tu-dominio/api/auth/callback/github` |
| Validacion build | Relajada en dev | [src/lib/server-env.ts](src/lib/server-env.ts) falla el build si falta secreto, URL, Firebase o par GitHub incompleto |

### Checklist: secretos y despliegue

1. Generar secreto: `openssl rand -base64 32` → `NEXTAUTH_SECRET`.
2. Firebase: Authentication → Sign-in method → Email/Password activado.
3. GitHub OAuth (opcional): OAuth App con callback `/api/auth/callback/github` en local y produccion.
4. Vercel: mismas variables en Preview y Production; redeploy tras cambios.

---

## Scripts

- `npm run dev`: servidor de desarrollo.
- `npm run build`: build de produccion.
- `npm run start`: ejecutar build de produccion.
- `npm run lint`: analisis estatico con ESLint.

---

## Rutas de la app

- `/`: inicio publico del proyecto.
- `/login`: inicio de sesion (email/password y GitHub si esta configurado).
- `/register`: crear cuenta con Firebase.
- `/dashboard`: panel privado principal (protegida).
- `/tasks/new`: crear pedido (protegida).
- `/tasks/[id]`: ver/editar/eliminar pedido (protegida).
- `/stats`: resumen operativo (protegida).

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
  - **400**: body invalido o error de validacion.
  - **401**: no autenticado.
- `GET /api/tasks/:id`
  - **200**: devuelve `Task`.
  - **404**: no encontrado.
  - **401**: no autenticado.
- `PUT /api/tasks/:id`
  - **200**: devuelve `Task` actualizado.
  - **400**: body invalido o error de validacion.
  - **404**: no encontrado.
  - **401**: no autenticado.
- `DELETE /api/tasks/:id`
  - **200**: devuelve `Task` eliminado.
  - **404**: no encontrado.
  - **401**: no autenticado.

### Auth (NextAuth)

Ruta catch-all: `src/app/api/auth/[...nextauth]/route.ts`. No hay `POST /api/auth/login` custom.

- `GET/POST /api/auth/*` — rutas internas de NextAuth (sesion, callback credentials, callback github, signout, etc.).
- `GET /api/auth/session` — sesion actual.

El login desde la UI usa `signIn()` del cliente (`redirect: false` para credentials).

---

## Modelo de datos

`Task` (`src/types/task.ts`):

- `id: string`
- `title: string`
- `description?: string`
- `status: "pending" | "in_progress" | "done"`
- `createdAt: string` (ISO)
- `updatedAt: string` (ISO)

---

## Autenticacion (Auth.js + Firebase + OAuth)

Stack:

- **Auth.js (NextAuth)**: sesion JWT en cookie, proveedores en [src/lib/auth.ts](src/lib/auth.ts), handler en `src/app/api/auth/[...nextauth]/route.ts`.
- **Firebase Auth**: registro en cliente (`/register`); validacion de email/password en servidor vía REST (`signInWithPassword` en [src/lib/firebase-auth-rest.ts](src/lib/firebase-auth-rest.ts)).
- **GitHub OAuth** (opcional): boton en `/login` si `GITHUB_ID` y `GITHUB_SECRET` estan definidos.

Rutas de autenticacion:

| Ruta | Acceso | Comportamiento |
| ---- | ------ | -------------- |
| `/login` | Publica | Email/password (`signIn("credentials", { redirect: false })`) y GitHub si esta configurado. |
| `/register` | Publica | Alta con Firebase SDK; tras crear cuenta, login en `/login?registered=1`. |
| `/dashboard` | Privada | Panel principal; requiere sesion (middleware). |

Flujo resumido:

1. **Credentials**: formulario → Auth.js → Firebase REST en servidor → JWT de sesion → redirect a `callbackUrl` / `next` seguro o `/dashboard`.
2. **GitHub**: `signIn("github")` → GitHub → `/api/auth/callback/github` → sesion Auth.js → mismo destino post-login.
3. **Proteccion**: [middleware.ts](middleware.ts) redirige paginas sin sesion a `/login`; APIs `/api/tasks` devuelven `401` JSON.

Detalle: [docs/seguridad/oauth.md](docs/seguridad/oauth.md), [docs/seguridad/middleware.md](docs/seguridad/middleware.md), [docs/seguridad/credenciales.md](docs/seguridad/credenciales.md).

---

## Verificacion del flujo auth

### Automatica

```bash
npm run verify:auth
```

Comprueba que el login use `signIn("credentials", { redirect: false })`, que no exista `POST /api/auth/login` custom ni `document.cookie` manual en modulos de auth, y que los redirects/errores sigan el contrato del proyecto.

Despues: `npm run lint` y `npm run build`.

### Manual (checklist rapido)

1. **Sin sesion**: abrir `/dashboard` → debe ir a `/login` con `callbackUrl` (y a menudo `next`) apuntando a `/dashboard`.
2. **Registro**: en `/register` crear cuenta → mensaje en `/login?registered=1` → login con esas credenciales → llegar a `/dashboard`.
3. **Credentials erroneas**: contraseña incorrecta → «Credenciales invalidas.» (sin filtrar si el email existe).
4. **API protegida**: `GET /api/tasks` sin cookie de sesion → `401` (p. ej. pestaña anonima o `curl`).
5. **Deep link**: sin sesion, `/tasks/new` → login → tras entrar, volver a `/tasks/new`.
6. **OAuth** (si GitHub configurado): «Continuar con GitHub» → consentimiento → vuelta autenticado a destino valido.
7. **Sesion activa**: con sesion, visitar `/login` o `/register` → redireccion a `/dashboard` (o `callbackUrl` valido).

---

## Limitaciones conocidas

- Pedidos persistidos en cookie por sesion; no hay base de datos de tareas.
- Usuarios gestionados en Firebase; no hay panel de administracion de usuarios en la app.
