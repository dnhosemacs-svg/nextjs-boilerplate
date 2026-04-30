# TaskFlow Carpinteria

Aplicacion web de gestion de pedidos de carpinteria construida con Next.js App Router.
Incluye CRUD de pedidos con Route Handlers, autenticacion demo por cookie, rutas protegidas con middleware y pagina de estadisticas con ISR.

## Arquitectura

- **Frontend**: App Router en `src/app` con Server Components para render inicial.
- **Interactividad**: Client Components en `src/components` para formularios, acciones y navegacion de cliente.
- **API**: Route Handlers en `src/app/api`.
- **Validacion**: esquemas Zod en `src/lib/validators/task.ts`.
- **Persistencia**: MongoDB Atlas con Mongoose (`src/lib/mongodb.ts`, `src/models/task.ts`).
- **Proteccion de rutas**: `middleware.ts` para `/tasks/*`.

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Configuracion

Variables necesarias:

```bash
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=taskflow
```

Variable opcional recomendada:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Ejecucion local

```bash
npm install
npm run dev
```

App disponible en [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev`: servidor de desarrollo.
- `npm run build`: build de produccion.
- `npm run start`: ejecutar build de produccion.
- `npm run lint`: analisis estatico con ESLint.

## Rutas

- `/`: listado de pedidos y acciones principales.
- `/login`: autenticacion demo.
- `/tasks/new`: alta de pedido (protegida).
- `/tasks/[id]`: detalle, edicion y borrado (protegida).
- `/stats`: metricas basicas con ISR (`revalidate = 60`).

Rutas auxiliares:
- `src/app/loading.tsx`
- `src/app/not-found.tsx`

## API

### Tasks

- `GET /api/tasks`
  - **200**: devuelve `Task[]`.
- `POST /api/tasks`
  - **201**: devuelve `Task` creado.
  - **400**: body invalido o error de validacion.
- `GET /api/tasks/:id`
  - **200**: devuelve `Task`.
  - **404**: no encontrado.
- `PUT /api/tasks/:id`
  - **200**: devuelve `Task` actualizado.
  - **400**: body invalido o error de validacion.
  - **404**: no encontrado.
- `DELETE /api/tasks/:id`
  - **200**: devuelve `Task` eliminado.
  - **404**: no encontrado.

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

## Modelo de datos

`Task` (`src/types/task.ts`):
- `id: string`
- `title: string`
- `description?: string`
- `status: "pending" | "in_progress" | "done"`
- `createdAt: string` (ISO)
- `updatedAt: string` (ISO)

## Decisiones tecnicas

- Server Components para carga inicial y SSR.
- Client Components solo donde hay estado/eventos (`useState`, `useRouter`, `useSearchParams`).
- Validacion centralizada con Zod para entrada de API.
- Persistencia en MongoDB para consistencia entre sesiones y despliegues.
- ISR en `/stats` para demostrar regeneracion incremental.

## Optimizaciones Next.js

- `next/image` en la home.
- `generateMetadata` dinamico en `src/app/tasks/[id]/page.tsx`.
- `next/font/google` (Geist) en `src/app/layout.tsx`.
- ISR con `revalidate = 60` en `src/app/stats/page.tsx`.

## Middleware

`middleware.ts`:
- protege `/tasks/:path*` si no hay cookie de auth.
- redirige a `/login?next=<ruta_original>`.
- evita acceso a `/login` cuando la sesion ya esta activa.

## Despliegue

- Plataforma: Vercel
- URL: `<PEGA_AQUI_TU_URL_DE_VERCEL>`

Validacion post-deploy:
- rutas publicas y protegidas operativas.
- CRUD funcional en `/api/tasks`.
- login/logout operativos.
- pagina `/stats` regenerando por intervalo.

## Verificacion SSR

1. Abrir DevTools > Network.
2. Recargar la pagina.
3. Inspeccionar la respuesta del documento HTML inicial.
4. Verificar que el contenido principal se entrega renderizado desde servidor.

## Limitaciones conocidas

- Sin ownership por usuario: los pedidos son compartidos por todos los usuarios.
- Autenticacion demo sin proveedor real.
- No apto para produccion sin capa de datos persistente y auth robusta.
