# TaskFlow Carpinteria

> Panel interno para gestionar pedidos del taller.

Aplicacion web de gestion de pedidos de carpinteria construida con Next.js App Router. Incluye CRUD de pedidos, autenticacion demo con cookie HTTP-only, proteccion de rutas con middleware y panel de estadisticas.


| Despliegue | URL                                                     |
| ---------- | ------------------------------------------------------- |
| Vercel     | `https://nextjs-boilerplate-sigma-eosin-30.vercel.app/` |


---

## Caracteristicas

- CRUD completo de pedidos (`/api/tasks` y `/api/tasks/:id`).
- Login demo por email/password con cookie de sesion.
- Rutas protegidas para trabajo interno (`/dashboard`, `/tasks/*`, `/stats`).
- Redireccion post-login con `next` para mantener el flujo.
- UI con Server Components + Client Components donde hay estado.

---

## Tecnologias


| Capa                 | Uso                                                  |
| -------------------- | ---------------------------------------------------- |
| Next.js (App Router) | Rutas, renderizado servidor/cliente y Route Handlers |
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
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   └── logout/route.ts
│   │   │   └── tasks/
│   │   │       ├── route.ts
│   │   │       └── [id]/route.ts
│   │   ├── dashboard/page.tsx
│   │   ├── login/page.tsx
│   │   ├── stats/page.tsx
│   │   ├── tasks/
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth-login-form.tsx
│   │   ├── auth-session-controls.tsx
│   │   ├── site-navbar.tsx
│   │   └── tasks/
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── tasks-cookie-store.ts
│   │   └── validators/task.ts
│   └── types/task.ts
└── README.md
```

---

## Descargar y ejecutar

```bash
git clone https://github.com/dnhosemacs-svg/nextjs-boilerplate
cd nextjs-boilerplate
npm install
npm run dev
```

Aplicacion disponible en [http://localhost:3000](http://localhost:3000).

---

## Configuracion

Crea `.env.local` en la raiz del proyecto (no se sube a git) y define las variables que necesites.

| Variable | Entorno | Descripcion |
| -------- | ------- | ----------- |
| `NEXTAUTH_SECRET` | Produccion obligatoria | Firma de JWT de NextAuth. En local es opcional (hay aviso y valor solo-dev). |
| `AUTH_SECRET` | Opcional | Alias; si ya usas solo `NEXTAUTH_SECRET`, no hace falta. |
| `NEXTAUTH_URL` | Produccion recomendada | URL publica de la app (OAuth y sesion). Ejemplo local: `http://localhost:3000`. |
| `VERCEL_URL` | Vercel (automatico) | La plataforma la inyecta; si existe, cuenta como URL canonica en validacion de build. |
| `NEXT_PUBLIC_APP_URL` | Opcional | Base para enlaces desde el cliente si no quieres depender de `VERCEL_URL`. |
| `GITHUB_ID` / `GITHUB_SECRET` | Opcional | OAuth GitHub; deben ir juntos o ninguno. |

### Checklist: secretos y Vercel

1. **Generar secreto** (en terminal, cualquier SO con OpenSSL instalado):

   ```bash
   openssl rand -base64 32
   ```

   Pega el resultado en `NEXTAUTH_SECRET` de `.env.local` y en el panel de Vercel.

2. **Variables en local**: en `.env.local` define al menos `NEXTAUTH_SECRET` y `NEXTAUTH_URL=http://localhost:3000` antes de un `npm run build` local en modo produccion.

3. **Fallos controlados**: en `NODE_ENV=production`, `next build` importa la validacion de [src/lib/server-env.ts](src/lib/server-env.ts). Si falta el secreto, o la URL canonica (`NEXTAUTH_URL`, `VERCEL_URL` o `NEXT_PUBLIC_APP_URL`), o solo uno de los pares GitHub, el build termina con un mensaje `[env] ...` explicando que falta.

4. **Vercel (Preview y Production)**: Project Settings > Environment Variables. Define `NEXTAUTH_SECRET` en ambos entornos (mismo valor o distintos; distintos invalidan cookies entre entornos). Define `NEXTAUTH_URL` como la URL estable del despliegue (produccion: tu dominio; preview: puedes usar la URL de preview o confiar en `VERCEL_URL` que ya inyecta Vercel). Repite `GITHUB_ID` y `GITHUB_SECRET` si usas login con GitHub.

---

## Scripts

- `npm run dev`: servidor de desarrollo.
- `npm run build`: build de produccion.
- `npm run start`: ejecutar build de produccion.
- `npm run lint`: analisis estatico con ESLint.

---

## Rutas de la app

- `/`: inicio publico del proyecto.
- `/login`: acceso por credenciales demo.
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

- `POST /api/auth/callback/credentials`
  - Maneja el login del proveedor `credentials` (interno de NextAuth).
- `POST /api/auth/signout`
  - Cierra sesión (interno de NextAuth).
- `GET /api/auth/session`
  - Devuelve la sesión actual.

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

- Login exitoso crea la cookie de sesión de NextAuth (JWT firmado con `NEXTAUTH_SECRET`).
- Middleware protege paginas internas y API de tareas.
- Si no hay sesion y entras a ruta protegida, redirige a `/login?next=<ruta>`.
- Si login no tiene `next`, redirige a `/dashboard`.
- Si ya hay sesion y visitas `/login`, redirige a `/dashboard`.

---

## Verificacion rapida

1. Cerrar sesion.
2. Intentar entrar a `/tasks/new` o `/stats` y verificar redireccion a `/login`.
3. Iniciar sesion y confirmar retorno a la ruta indicada en `next`.
4. Probar `GET /api/tasks` sin sesion y validar `401`.
5. Volver a iniciar sesion y confirmar acceso normal.

---

## Limitaciones conocidas

- Persistencia en cookie por sesion; no hay base de datos.
- Autenticacion demo sin proveedor real.
- No apto para produccion sin auth robusta y almacenamiento persistente.

