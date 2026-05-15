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

Crea `.env.local` en la raiz del proyecto (no se sube a git). Ver plantilla en [.env.example](.env.example).

| Variable | Entorno | Descripcion |
| -------- | ------- | ----------- |
| `NEXTAUTH_SECRET` | Produccion obligatoria | Firma del JWT de NextAuth. Alias: `AUTH_SECRET`. |
| `NEXTAUTH_URL` | Produccion recomendada | URL publica (OAuth y sesion). Local: `http://localhost:3000`. |
| `VERCEL_URL` | Vercel (automatico) | Cuenta como URL canonica en validacion de build. |
| `GITHUB_ID` / `GITHUB_SECRET` | Opcional | OAuth GitHub; deben ir juntos o ninguno. |
| `FIREBASE_API_KEY` | Produccion obligatoria | Clave web Firebase; login email/password en servidor. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Cliente | Misma clave web; registro en navegador. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Cliente | `authDomain` de firebaseConfig. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Cliente | `projectId` de firebaseConfig. |

### Checklist: secretos y Vercel

1. **Generar secreto**:

   ```bash
   openssl rand -base64 32
   ```

   Pegar en `NEXTAUTH_SECRET` (local y panel de Vercel).

2. **Firebase**: habilitar Email/Password en Authentication. Copiar clave y `firebaseConfig` desde la consola.

3. **GitHub OAuth** (opcional): callback `http://localhost:3000/api/auth/callback/github` y el de produccion en tu dominio Vercel.

4. **Build en produccion**: [src/lib/server-env.ts](src/lib/server-env.ts) valida secreto, URL canonica, `FIREBASE_API_KEY` y par GitHub. Errores con prefijo `[env]`.

5. **Vercel**: definir las mismas variables en Preview y Production (`NEXTAUTH_SECRET`, Firebase, GitHub si aplica).

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

## Flujo de autenticacion

- Login con email/password: `signIn("credentials")` → NextAuth → Firebase REST (`signInWithPassword`).
- Registro: Firebase SDK en `/register`; opcional auto-login con credentials.
- Sesion: cookie JWT de NextAuth firmada con `NEXTAUTH_SECRET`.
- Middleware protege paginas internas y `/api/tasks`.
- Sin sesion en ruta protegida: `/login?next=<ruta>&callbackUrl=<ruta>` (rutas externas rechazadas).
- Tras login: redireccion a `callbackUrl` o `next` validos; si no hay, `/dashboard`.
- Con sesion en `/login` o `/register`: redireccion al destino de la query o `/dashboard`.

---

## Verificacion rapida

1. Cerrar sesion.
2. Entrar a `/tasks/new` sin sesion → redireccion a `/login` con `next` y `callbackUrl`.
3. Iniciar sesion → volver a `/tasks/new`.
4. `GET /api/tasks` sin sesion → `401`.
5. Probar registro en `/register` y login con la cuenta creada.
6. Si hay `GITHUB_ID`/`GITHUB_SECRET`, probar "Continuar con GitHub".

---

## Limitaciones conocidas

- Pedidos persistidos en cookie por sesion; no hay base de datos de tareas.
- Usuarios gestionados en Firebase; no hay panel de administracion de usuarios en la app.
