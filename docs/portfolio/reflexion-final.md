# Reflexión final del portfolio

**Tarjeta 5.3** — Entregable `docs`  
**Proyecto:** TaskFlow Carpintería  
**Fecha:** 2026-06-12

Cierre del proyecto full-stack: qué costó más, qué decisión cambiaría y cómo presentar la arquitectura en una entrevista técnica.

---

## Checklist tarjeta 5.3

- [x] Parte que más costó y cómo la resolviste
- [x] Decisión técnica que cambiarías al rehacer
- [x] Cómo explicarías la arquitectura en entrevista

---

## 1. La parte que más costó y cómo la resolví

### Stock: físico, reservado y disponible

Lo que más tiempo y cuidado consumió fue el **modelo de stock** cuando aparecieron los **pedidos con reservas**. No bastaba con un campo `stock` editable: el taller necesita saber cuánto hay en almacén, cuánto está comprometido por pedidos aprobados y cuánto queda libre para nuevos trabajos.

**Por qué dolió:**

- Tres magnitudes distintas que deben cuadrar en todo momento: `disponible = físico − reservado`.
- El físico no es un número fijo en UI: se deriva de movimientos (`IN`, `OUT`, `ADJUST`) en un libro mayor.
- Aprobar un pedido debe crear reservas; pasar a producción debe consumir material sin doble descuento.
- Todo con `Decimal` en Postgres, no `float`, para no perder décimas de tablero o céntimos en costes.

**Cómo lo resolví:**

1. **Servicio de dominio único** — `src/lib/stock-service.ts` con `getMaterialStock`, `recordMovement` y errores tipados (`INSUFFICIENT_AVAILABLE`, etc.). Los Route Handlers no reimplementan la lógica.
2. **Agregados en paralelo** — `computeMaterialStockDecimal` hace cuatro `aggregate` con `Promise.all` (entradas, salidas, ajustes, reservas activas).
3. **Tests sin base de datos real** — Vitest mockea Prisma y comprueba escenarios como «físico 8, reservado 2, disponible 6». Eso permitió iterar sin depender de Neon en cada `npm test`.
4. **UI alineada** — `MaterialList` muestra las cuatro columnas; el ajuste de físico dispara un movimiento `ADJUST`, no un `PATCH` ciego al campo.

**Segundo lugar (honorable mention):** auth en serverless — combinar NextAuth (JWT en cookie), Firebase REST en servidor para credenciales, roles en Postgres y `proxy.ts` como primera línea de defensa. La resolución fue documentar el flujo en [ADR-003](../adr/003-auth-serverless-proxy-nextauth-firebase.md) y scripts `verify:auth` para no regresar a guards solo en cliente.

---

## 2. Decisión técnica que cambiaría al rehacer

### Mantener dos APIs (`/api/products` y `/api/materials`) durante la migración de dominio

En retrospectiva, la decisión de **no borrar `/api/products` de inmediato** (documentada como [DT-002](../auditoria/deuda-tecnica.md#dt-002--duplicación-products-vs-materials-api--ui)) ahorró romper Postman y el vídeo demo, pero dejó:

- Dos route handlers idénticos que hay que mantener o divergir.
- Nombres legacy (`productFilters`, ruta `/products`) que contradicen el dominio `Material`.
- Documentación (`docs/api.md`, `state-management.md`) desalineada con el código activo.

**Al rehacer el proyecto:** haría el renombrado **en bloque** en un solo hito: modelo, API, hooks, rutas de página, query keys y colección Postman. Si hace falta compatibilidad, un redirect HTTP 308 de `/api/products` → `/api/materials` durante una semana, no dos implementaciones vivas.

**Otras decisiones que mantendría:**

- Next.js único en Vercel (sin Express aparte) — tipos y Zod compartidos.
- Neon con `DATABASE_URL` + `DIRECT_URL` — el dolor de confundirlas se resolvió con docs, no cambiando de BD.
- TanStack Query + Zustand — la separación datos-servidor / UI sigue siendo clara.

**Lo que sí planificaría antes:** tiempo real (Pusher o SSE) si el caso de uso es «varios operarios en almacén». Hoy es deuda consciente ([DT-003](../auditoria/deuda-tecnica.md#dt-003--tiempo-real-no-implementado-pusher--websockets)); en un taller real lo subiría al sprint 2, no al roadmap indefinido.

---

## 3. Cómo explicaría la arquitectura en una entrevista

### Elevator pitch (30 segundos)

> «TaskFlow Carpintería es un panel interno full-stack en **un solo despliegue Next.js 16** en Vercel. Tres módulos: **inventario** (materiales y stock en Postgres), **pedidos** (máquina de estados con reservas de material) y **auth** (NextAuth + Firebase + roles en base de datos). La API son Route Handlers; no hay Express separado. El cliente usa **TanStack Query** para datos del servidor y **Zustand** solo para filtros de UI.»

### Las tres capas (1–2 minutos)

```
Navegador          Vercel / Next.js              Neon PostgreSQL
─────────          ────────────────              ───────────────
React + Query  →   proxy.ts (auth/roles)    →   materials, movements
Zustand (filtros)  Route Handlers + Zod          orders, reservations
                   Prisma (pooler)               users
```

1. **Navegador** — React 19 App Router. Inventario en `/products` (etiqueta «Materiales»). Query cachea listados y snapshots de stock; Zustand guarda búsqueda y categoría sin duplicar la lista.
2. **Servidor** — Mismo repo y deploy. `proxy.ts` redirige páginas privadas y devuelve `401` en APIs sin sesión. Handlers validan con Zod y llaman a `stock-service` o Prisma. NextAuth emite JWT con `user.id` y `user.role`.
3. **Datos** — Neon serverless. Pooler en runtime; conexión directa solo para migraciones Prisma.

### Pregunta típica: «¿Cómo funciona el stock con pedidos?»

> «El stock **físico** es la suma neta de movimientos en un libro mayor. Cuando un pedido se **aprueba**, creo **reservas** en `order_reservations`: restan del **disponible** pero no del físico hasta que el pedido entra en **producción** y se registran salidas `OUT`. La UI muestra físico, reservado, disponible y mínimo; stock bajo es cuando disponible < mínimo. Toda esa lógica vive en `stock-service`, testeada con mocks de Prisma.»

### Pregunta típica: «¿Por qué NextAuth y Firebase?»

> «Firebase guarda contraseñas con hashing fuerte; yo no quiero una tabla `password`. NextAuth unifica sesión JWT para **SSR, middleware y APIs** con la misma cookie. El rol de negocio (`CLIENT`, `WORKER`, `ADMIN`) está en Postgres y se inyecta en el token en el callback `jwt`. GitHub OAuth es opcional para el mismo flujo de sesión.»

### Pregunta típica: «¿Qué deuda técnica asumes?»

> «Tres cosas honestas: **duplicado legacy** `/api/products` mientras la UI ya usa `materials`; **N+1 HTTP** al pedir stock por fila en el listado — mitigado con peticiones paralelas pero sin endpoint batch; y **sin tiempo real** — otra pestaña necesita F5. Los datos en Neon son consistentes; falta push al cliente. Está documentado en `docs/auditoria/deuda-tecnica.md`.»

### Pregunta típica: «¿Cómo aseguras calidad?»

> «CI en GitHub Actions: lint, TypeScript, Vitest con cobertura ≥ 80 % en `src/lib` y APIs de inventario, y build. Tests de dominio en `stock-service` y tests de Route Handlers con sesión mockeada. Scripts `verify:auth` para que nadie vuelva a proteger solo en `useEffect`.»

### Diagrama mental para la pizarra

Si piden dibujar en entrevista, este orden suele funcionar:

1. Usuario → **página** (`/products`) → **Query** → **API** (`/api/materials`) → **Prisma** → **Postgres**.
2. Añadir **lateral**: pedido aprobado → reserva → afecta columna «Reservado», no «Físico».
3. Añadir **caja auth**: cookie JWT → `proxy.ts` antes del handler.
4. Opcional: raya punteada «Pusher futuro» desde API hacia Query — muestra que conoces el límite actual.

---

## Enlaces útiles para profundizar

| Tema | Documento |
|------|-----------|
| Diagrama visual | [docs/arquitectura/diagrama.png](../arquitectura/diagrama.png) |
| ADRs | [docs/adr/](../adr/) |
| Deuda técnica | [docs/auditoria/deuda-tecnica.md](../auditoria/deuda-tecnica.md) |
| Estado cliente | [docs/state-management.md](../state-management.md) |
| Demo en vídeo | [README — Demo](../../README.md#demo) |

---

## Versión

- **v1** — 2026-06-12 — Tarjeta 5.3: reflexión de cierre del portfolio.
