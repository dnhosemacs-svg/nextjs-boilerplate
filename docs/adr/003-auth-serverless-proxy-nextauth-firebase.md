# ADR-003: Autenticación en serverless (proxy + NextAuth + Firebase)

- **Estado:** Aceptado
- **Fecha:** 2026-06-12
- **Ámbito:** Sesión, login, protección de rutas y APIs

## Contexto

En serverless (Vercel):

- Las páginas privadas no deben depender solo de `useEffect` en el cliente (flash de contenido, bypass con `curl`).
- Las APIs deben devolver **401** antes de ejecutar lógica sensible.
- El taller necesita roles de negocio (`CLIENT`, `WORKER`, `ADMIN`) en sesión y en Postgres.
- Login con correo/contraseña (Firebase) y GitHub OAuth opcional.

## Decisión

Arquitectura en tres capas:

### 1. Proxy de Next.js (`src/proxy.ts`)

Primera línea de defensa (equivalente al middleware clásico en Next.js 16):

- **Páginas privadas** → redirect a `/login` con `callbackUrl` / `next` seguro.
- **APIs sensibles** (`src/lib/protected-api-routes.ts`) → **401 JSON** sin cookie válida.
- **Roles en edge:** inventario y admin según `getTokenRole` + `route-access.ts`.
- **Sesión activa en `/login` o `/register`** → redirect a destino post-login (`getPostLoginDestination`).

Matcher exportado en `config` del mismo archivo.

### 2. NextAuth (Auth.js) — sesión JWT

- Configuración: `src/lib/auth.ts` (`session.strategy: "jwt"`, `maxAge: 8h`).
- Handler: `src/app/api/auth/[...nextauth]/route.ts`.
- Callbacks `jwt` / `session` inyectan `user.id` y `user.role` desde Postgres (`users`).

### 3. Firebase Auth — credenciales

| Flujo | Dónde | Cómo |
|-------|-------|------|
| **Login** | Servidor | `signInWithPassword` vía REST (`src/lib/firebase-auth-rest.ts`) dentro del `CredentialsProvider` |
| **Registro** | Cliente | Firebase SDK (`src/lib/firebase-client.ts`) en `/register` |
| **Rol de negocio** | Postgres | Tabla `users`; no confiar solo en custom claims de Firebase |

GitHub OAuth: proveedor opcional si `GITHUB_ID` + `GITHUB_SECRET` están definidos.

### Defensa en profundidad

Los Route Handlers vuelven a comprobar sesión con `requireApiSession` / `requireRole` (`src/lib/api-auth.ts`) aunque el proxy ya haya filtrado.

## Consecuencias

### Positivas

- Una cookie JWT para SSR, APIs y cliente (`SessionProvider`).
- Firebase no expone la validación de contraseña en el navegador en el login (REST en servidor).
- Roles en Postgres permiten lógica de taller sin depender de Firebase Admin en cada request.

### Negativas

- Tres piezas que configurar (proxy, NextAuth, Firebase + variables en Vercel).
- JWT: revocación inmediata de sesión más compleja que sesión en BD.
- Sync de usuarios Firebase ↔ Postgres requiere scripts/admin (`sync-firebase-users`).

## Alternativas consideradas

| Alternativa | Por qué no |
|-------------|------------|
| **Solo Firebase en cliente** | Sin sesión fiable en RSC/API; secretos y roles expuestos o duplicados. |
| **Solo NextAuth sin Firebase** | El ejercicio exige Firebase para registro y credenciales del consola. |
| **Sesión en base de datos** | Más consultas por request en serverless; JWT más ligero para MVP. |
| **Protección solo en cliente** | No bloquea `curl` ni HTML inicial de rutas privadas. |

## Referencias

- `src/proxy.ts`, `src/lib/auth.ts`, `src/lib/firebase-auth-rest.ts`, `src/lib/protected-api-routes.ts`, `src/lib/api-auth.ts`
- [docs/seguridad/middleware.md](../seguridad/middleware.md)
- [docs/seguridad/oauth.md](../seguridad/oauth.md)
- [docs/seguridad/credenciales.md](../seguridad/credenciales.md)
