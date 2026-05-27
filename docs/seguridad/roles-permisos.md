# Matriz de permisos (v1)

Leyenda: **C** crear · **R** leer · **U** actualizar · **D** eliminar · **—** sin acceso

| Recurso      | ADMIN | WORKER        | CLIENT              |
|-------------|-------|---------------|---------------------|
| Usuarios    | CRUD  | —             | —                   |
| Materiales  | CRUD  | R, U stock    | — (sin UI almacén)  |
| Movimientos | CRUD  | C (ajuste)    | —                   |
| Pedidos     | CRUD  | CRUD          | CRUD (propios*)     |
| Reservas    | CRUD  | R             | CRUD (propias*)     |

\* **Propios** = cuando el modelo tenga `ownerId` (fase posterior). Hasta entonces, pedidos/reservas comparten el acceso definido en código.

## Mapeo al código actual

| Dominio (futuro) | Rutas / API en el boilerplate |
|------------------|-------------------------------|
| Materiales       | `/products`, `/categories`, `/api/products`, `/api/categories` |
| Movimientos      | `PATCH /api/products/:id/stock` |
| Pedidos          | `/tasks/*`, `/api/tasks` |
| Usuarios         | Pendiente: `/admin/*` |
| Reservas         | Pendiente |

## Permisos en UI (páginas)

| Ruta           | ADMIN | WORKER | CLIENT |
|----------------|-------|--------|--------|
| `/dashboard`   | ✓     | ✓      | ✓      |
| `/tasks/*`     | ✓     | ✓      | ✓      |
| `/stats`       | ✓     | ✓      | ✓      |
| `/products`    | ✓     | ✓      | ✗      |
| `/categories`  | ✓     | ✓      | ✗      |
| `/admin/*`     | ✓     | ✗      | ✗      |

## Roles

Definidos en `src/types/user-role.ts`:

- **ADMIN** — gestión completa y futura administración de usuarios.
- **WORKER** — operativa de taller: inventario y stock, sin panel admin.
- **CLIENT** — pedidos y reservas propias; sin acceso al almacén (UI ni APIs de inventario).

## Implementación

| Capa        | Responsabilidad |
|-------------|-----------------|
| Prisma      | Campo `role` en modelo `User` |
| NextAuth    | Rol en JWT y `session.user.role` |
| APIs        | `requireRole(...)` junto a `requireApiSession()` |
| Middleware  | Bloqueo de `/products`, `/categories`, `/admin/*` según rol |
| UI          | Ocultar navegación de inventario a `CLIENT` |

Ver también: [middleware](middleware.md), [API](../api.md).
