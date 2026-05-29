# Matriz de permisos (v1)

Leyenda: **C** crear · **R** leer · **U** actualizar · **D** eliminar · **—** sin acceso

| Recurso      | ADMIN | WORKER        | CLIENT              |
|-------------|-------|---------------|---------------------|
| Usuarios    | CRUD  | —             | —                   |
| Materiales  | CRUD  | R, U stock    | — (sin UI almacén)  |
| Movimientos | CRUD  | C (ajuste)    | —                   |
| Pedidos     | CRUD  | CRUD          | CRUD (propios*)     |
| Reservas    | CRUD  | R             | — (vía flujo taller)|

\* **Propios** = `Order.clientId === session.user.id`. Si un CLIENT accede a un pedido ajeno, la API responde **403** (`src/lib/order-access.ts`).

## Mapeo al código actual

| Dominio   | Rutas / API |
|-----------|-------------|
| Materiales | `/products`, `/categories`, `/api/materials`, `/api/categories` |
| Movimientos | `PATCH /api/materials/:id/stock`, `/api/materials/:id/movements` |
| Pedidos   | `/orders`, `/my-orders`, `/orders/new`, `/api/orders`, `/api/orders/:id`, `/api/orders/:id/status`, `/api/orders/:id/materials`, `/api/orders/:id/consume` |
| Usuarios  | `/admin/users`, `/api/users` (ADMIN) |
| Reservas  | Automáticas al `APPROVED` / liberación al `CANCELLED` (`src/lib/order-reservations.ts`) |

## Permisos en UI (páginas)

| Ruta           | ADMIN | WORKER | CLIENT |
|----------------|-------|--------|--------|
| `/dashboard`   | ✓     | ✓      | ✓      |
| `/orders`, `/orders/new`, `/orders/[id]` | ✓ | ✓ | — |
| `/my-orders`   | —     | —      | ✓      |
| `/stats`       | ✓     | ✓      | ✓      |
| `/products`    | ✓     | ✓      | ✗      |
| `/categories`  | ✓     | ✓      | ✗      |
| `/admin/*`     | ✓     | ✗      | ✗      |
| `/tasks/*`     | ✓     | ✓      | ✓      | *(legacy demo)* |

## Roles

Definidos en `src/types/user-role.ts`:

- **ADMIN** — gestión completa, usuarios y operativa de taller.
- **WORKER** — inventario, stock y ciclo de vida de pedidos (sin panel admin).
- **CLIENT** — pedidos propios; sin acceso al almacén (UI ni APIs de materiales).

## Transiciones de pedido (resumen)

| Acción | CLIENT (propio) | WORKER / ADMIN |
|--------|-----------------|----------------|
| DRAFT → PENDING | ✓ | ✓ |
| PENDING → APPROVED | — | ✓ (reserva materiales) |
| APPROVED → IN_PRODUCTION → READY → DELIVERED | — | ✓ |
| Cancelar (estados permitidos) | ✓* | ✓ |

\* CLIENT solo en estados `DRAFT` / `PENDING` del pedido propio.

Detalle: [flujo-estados](../pedidos/flujo-estados.md).

## Implementación

| Capa        | Responsabilidad |
|-------------|-----------------|
| Prisma      | Campo `role` en modelo `User` |
| NextAuth    | Rol en JWT y `session.user.role` |
| APIs        | `requireRole(...)` en handlers |
| Pedidos     | `denyIfClientNotOrderOwner` en rutas por id |
| Middleware  | Bloqueo de `/products`, `/categories`, `/admin/*` según rol |
| UI          | `getOrderNavItems` en `src/lib/navigation.ts` |

Ver también: [middleware](middleware.md), [API inventario](../api.md), [README pedidos y roles](../../README.md#pedidos-y-roles).
