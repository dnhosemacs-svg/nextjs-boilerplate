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
- Rutas protegidas para trabajo interno (`/tasks/*`, `/stats`).
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

Variable opcional recomendada:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Scripts

- `npm run dev`: servidor de desarrollo.
- `npm run build`: build de produccion.
- `npm run start`: ejecutar build de produccion.
- `npm run lint`: analisis estatico con ESLint.

---

## Rutas de la app

- `/`: inicio con lista de pedidos y accesos rapidos.
- `/login`: acceso por credenciales demo.
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

### Auth (demo)

- `POST /api/auth/login`
  - **200**: sesion creada.
  - **400**: payload invalido.
  - **401**: credenciales invalidas.
- `POST /api/auth/logout`
  - **200**: sesion eliminada.

Credenciales demo:

- `admin@carpinteria.local`
- `123456`

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

- Login exitoso crea cookie `taskflow_auth` (`httpOnly`, `sameSite: "lax"`).
- Middleware protege paginas internas y API de tareas.
- Si no hay sesion y entras a ruta protegida, redirige a `/login?next=<ruta>`.
- Si ya hay sesion y visitas `/login`, redirige a `/`.

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

