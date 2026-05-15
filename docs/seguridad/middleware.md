# Middleware y protección de rutas

Este documento explica **por qué** TaskFlow Carpintería protege rutas en el **middleware de Next.js** y no solo con comprobaciones en el cliente (`useEffect`, `useSession`, etc.), y describe la **estrategia concreta** del repositorio.

---

## Middleware vs protección en `useEffect` (cliente)

| Aspecto | Middleware (servidor / edge) | Solo cliente (`useEffect`) |
| ------- | ------------------------------ | -------------------------- |
| **Cuándo actúa** | Antes de servir la página o la API | Después de hidratar React en el navegador |
| **HTML inicial** | Puede redirigir sin enviar contenido privado | La página privada puede renderizarse primero |
| **APIs** | Puede devolver `401` sin ejecutar lógica sensible | `fetch` del cliente puede dispararse antes del redirect |
| **Bypass** | No depende de que el usuario ejecute JS | Desactivar JS o llamar la API con `curl` evita el guard |
| **SEO / caché** | Respuesta coherente para crawlers | Crawlers pueden indexar fragmentos públicos por error |

La protección en cliente es útil para **UX** (ocultar botones, mostrar nombre de usuario), no como **única** barrera de seguridad.

---

## Por qué «solo cliente» no evita acceso inicial ni exposición de datos

### 1. Flash de contenido (FOUC de datos sensibles)

Patrón frágil:

```tsx
"use client";
useEffect(() => {
  if (status === "unauthenticated") router.replace("/login");
}, [status]);
```

**Qué ocurre:**

1. El servidor envía el HTML/JS de `/dashboard` (o un Server Component con datos).
2. El usuario ve durante un instante layout, títulos o skeletons de zona privada.
3. Solo entonces React ejecuta el efecto y redirige.

En aplicaciones con datos reales, ese flash puede incluir metadatos, IDs o texto que no deberían mostrarse sin sesión.

### 2. Peticiones no bloqueadas

Aunque la UI redirija:

```bash
curl -i https://tu-app.vercel.app/api/tasks
```

sin cookie de sesión debe recibir **`401`**, no `200` con lista de pedidos. Un `useEffect` en la página **no intercepta** peticiones directas a la API.

### 3. Acceso directo a rutas

El usuario puede abrir `/tasks/new` en una pestaña nueva o desde un marcador. Sin middleware, Next.js entrega la ruta; el guard del cliente corre tarde o no corre si falla el bundle.

### 4. Falsa sensación de seguridad

`session` en el cliente se obtiene con `getSession()` / `useSession()`: información **derivada** de la cookie. Un atacante no necesita «hackear» React; necesita **no tener** cookie válida y aun así muchas apps mal protegidas sirven el shell de la página privada.

---

## Ejemplos de ataque / riesgo

| Escenario | Sin middleware (solo cliente) | Con middleware (este proyecto) |
| --------- | ------------------------------ | ------------------------------ |
| Visitar `/dashboard` sin sesión | Breve render + redirect JS | Redirect inmediato a `/login?callbackUrl=...` |
| `GET /api/tasks` sin cookie | Posible `200` si el handler no comprueba sesión | `401` JSON en middleware **antes** del handler |
| Desactivar JavaScript | Página privada puede quedar estática visible | Redirect HTTP sigue funcionando (páginas con `withAuth`) |
| Automatización / scraping | Scripts obtienen HTML de rutas internas | Misma respuesta de no autorizado para humanos y bots |

---

## Estrategia elegida en el proyecto

Archivo central: **`middleware.ts`** en la raíz del repo.

### Dos capas en un solo middleware

```text
Petición entrante
       │
       ▼
┌──────────────────────┐
│ handleProtectedApi   │  Rutas /api/tasks/* sin token → 401 JSON
└──────────┬───────────┘
           │ (si no es API protegida o hay token)
           ▼
┌──────────────────────┐
│ withAuth (NextAuth)  │  Páginas privadas sin token → redirect /login
│                      │  /login o /register con token → redirect destino
└──────────────────────┘
```

### 1. APIs: `handleProtectedApi`

- Prefijos definidos en `src/lib/protected-api-routes.ts` (`PROTECTED_API_PREFIXES`, hoy `/api/tasks`).
- Usa `getToken({ req, secret })` de `next-auth/jwt`.
- Responde `NextResponse.json({ error: "No autenticado" }, { status: 401 })`.
- **Motivo:** `withAuth` de NextAuth redirige a `/login` (HTML); las APIs deben devolver JSON, no una página de login.

### 2. Páginas: `withAuth`

- Rutas en el `matcher`: `/dashboard/*`, `/tasks/*`, `/stats`, `/login`, `/register`.
- Callback `authorized`:
  - `/login` y `/register`: siempre accesibles (para mostrar formulario).
  - Resto del matcher: requiere `token` presente.
- Si hay sesión en `/login` o `/register`: redirect a `getPostLoginDestination()` (evita bucles y respeta `callbackUrl` / `next`).

### 3. Redirección a login

- `pages.signIn: "/login"`.
- Auth.js añade `callbackUrl` con la ruta solicitada.
- `getPostLoginDestination()` en `src/lib/safe-redirect.ts` filtra rutas internas y rechaza open redirects (`//evil.com`).

### 4. Defensa en profundidad en handlers

Los Route Handlers de tareas pueden volver a comprobar sesión; el middleware es la **primera** línea. Al añadir una API sensible nueva:

1. Añadir prefijo en `protected-api-routes.ts`.
2. Incluir ruta en `config.matcher` de `middleware.ts`.

---

## Matcher actual

```ts
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tasks/:path*",
    "/stats",
    "/api/tasks/:path*",
    "/login",
    "/register",
  ],
};
```

Rutas **públicas** como `/` no pasan por este middleware; no necesitan protección de sesión.

---

## Qué no hace el middleware

- No sustituye validación de **autorización** (roles, pertenencia a recursos); solo autenticación «¿hay sesión?».
- No protege rutas que no estén en el `matcher`; hay que mantenerlo al día.
- No reemplaza buenas prácticas en Server Components (no pasar secretos al cliente).

---

## Referencias

- `middleware.ts`
- `src/lib/protected-api-routes.ts`
- `src/lib/safe-redirect.ts`
- Documentación Auth.js: [Middleware](https://authjs.dev/reference/nextjs/middleware)
