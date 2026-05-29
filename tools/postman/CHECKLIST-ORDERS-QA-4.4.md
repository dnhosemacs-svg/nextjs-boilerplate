# Checklist — Pedidos QA (tarjeta 4.4)

Verificación manual de seguridad, flujo y preparación IA.

## Antes de empezar

- [ ] `npm run dev` en marcha (`http://localhost:3000`)
- [ ] Dos usuarios **CLIENT** distintos (A y B) con sesión en Firebase + fila en `users`
- [ ] Usuario **WORKER** o **ADMIN** para pasos de taller (pasos 2–3)
- [ ] `npx prisma db seed` (o materiales con stock) y un `materialId` copiado para líneas
- [ ] Variable `cookie` = `next-auth.session-token=<valor del navegador>`
- [ ] Variables Postman: `orderId`, `materialId` (opcional)
- [ ] Entorno Postman importado desde `tools/postman/`

---

## 1. Cliente no accede pedido ajeno (API 403)

| # | Paso | Esperado |
| - | ---- | -------- |
| 1 | Login **cliente A** → cookie A | Sesión OK |
| 2 | `POST /api/orders` con body de mueble (sin `clientId`) | **201**, guardar `orderId` |
| 3 | Login **cliente B** → cookie B | Sesión OK |
| 4 | `GET /api/orders/{{orderId}}` | **403** `{ "error": "No autorizado" }` |
| 5 | `PATCH /api/orders/{{orderId}}` (body borrador válido) | **403** |
| 6 | `PATCH /api/orders/{{orderId}}/status` `{ "status": "PENDING" }` | **403** |

**Body ejemplo (paso 2):**

```json
{
  "furnitureType": "MESA",
  "params": { "largoCm": 140, "anchoCm": 80 },
  "notes": "QA 4.4 — pedido ajeno"
}
```

- [ ] Los tres endpoints devuelven **403** (no 404) para cliente B sobre pedido de A

---

## 2. Cancelar pedido libera reservas

La lógica está en `cancelOrder` → `releaseReservationsOnCancel` (`src/lib/order-workflow.ts`, `src/lib/order-reservations.ts`). Este bloque comprueba que al cancelar desde **`APPROVED`** o **`IN_PRODUCTION`** el stock reservado vuelve a estar disponible.

### Preparar pedido con reservas activas

Cookie de **WORKER** o **ADMIN** salvo donde se indique.

| # | Request | Body / notas | Esperado |
| - | ------- | ------------ | -------- |
| 1 | Login **CLIENT** (o WORKER con `clientId` en POST) | — | Cookie cliente/taller |
| 2 | `POST /api/orders` | Ver JSON abajo | **201** → `orderId` |
| 3 | `PUT /api/orders/{{orderId}}/materials` | `lines` con `materialId` + `plannedQty` | **200** |
| 4 | `PATCH /api/orders/{{orderId}}/status` | `{ "status": "PENDING" }` | **200** |
| 5 | Cookie **WORKER** | — | — |
| 6 | `PATCH /api/orders/{{orderId}}/status` | `{ "status": "APPROVED" }` | **200** (crea `RESERVE` + reservas activas) |

**POST pedido (paso 2):**

```json
{
  "furnitureType": "ESTANTERIA",
  "params": { "anchoCm": 100, "altoCm": 200, "profundidadCm": 30 },
  "notes": "QA 4.4 — cancelar reservas"
}
```

**PUT materiales (paso 3)** — sustituye `materialId` por un id real (Prisma Studio o `GET` materiales vía taller):

```json
{
  "lines": [
    { "materialId": "{{materialId}}", "plannedQty": 2 }
  ]
}
```

### Comprobar estado “antes de cancelar” (Prisma Studio)

- [ ] `orders.status` = `APPROVED`
- [ ] `order_reservations`: al menos una fila con `orderId` y `active = true`
- [ ] `stock_movements`: movimientos `RESERVE` para ese `orderId`

### Cancelar

| # | Request | Esperado |
| - | ------- | -------- |
| 7 | `PATCH /api/orders/{{orderId}}/status` con `{ "status": "CANCELLED" }` (WORKER) | **200**, `status`: `CANCELLED` |

Variante opcional: repetir el flujo hasta `IN_PRODUCTION` y cancelar desde ahí (misma liberación).

### Comprobar estado “después de cancelar” (Prisma Studio)

- [ ] `orders.status` = `CANCELLED`
- [ ] `order_reservations` del pedido: todas con `active = false`
- [ ] `stock_movements`: nuevos movimientos `RELEASE` con `reason` “Liberación al cancelar pedido” (o similar) y mismo `orderId`

### Cierre sección 2

- [ ] Tras **APPROVED** había reservas activas
- [ ] Tras **CANCELLED** no queda ninguna reserva `active = true` para ese pedido
- [ ] Existen movimientos **RELEASE** asociados al cancelar

---

## 3. Flujo feliz (aprobar → reservar → producir → entregar)

Recorrido completo sin cancelar:

`DRAFT` → `PENDING` → `APPROVED` (reserva) → `IN_PRODUCTION` (consumo real) → `READY` → `DELIVERED`

Código: transiciones en `src/lib/order-transitions.ts`; aprobar en `approveOrder`; consumo en `POST /api/orders/:id/consume`. Detalle del consume: [CHECKLIST-ORDERS-CONSUMO-REAL.md](CHECKLIST-ORDERS-CONSUMO-REAL.md).

### Secuencia API

| # | Rol | Método | Ruta | Body | Esperado |
| - | --- | ------ | ---- | ---- | -------- |
| 1 | CLIENT | POST | `/api/orders` | Ver JSON “Crear pedido” | **201**, `status`: `DRAFT` |
| 2 | WORKER | PUT | `/api/orders/{{orderId}}/materials` | Ver JSON “Líneas” | **200**, líneas en respuesta |
| 3 | CLIENT | PATCH | `/api/orders/{{orderId}}/status` | `{ "status": "PENDING" }` | **200** |
| 4 | WORKER | PATCH | `/api/orders/{{orderId}}/status` | `{ "status": "APPROVED" }` | **200** → reservas + `RESERVE` |
| 5 | WORKER | PATCH | `/api/orders/{{orderId}}/status` | `{ "status": "IN_PRODUCTION" }` | **200** |
| 6 | WORKER | POST | `/api/orders/{{orderId}}/consume` | Ver JSON “Consumo real” | **200**, `consumption` en body |
| 7 | WORKER | PATCH | `/api/orders/{{orderId}}/status` | `{ "status": "READY" }` | **200** |
| 8 | WORKER | PATCH | `/api/orders/{{orderId}}` | `{ "laborAmount": 150 }` *(opcional)* | **200** |
| 9 | WORKER | PATCH | `/api/orders/{{orderId}}/status` | `{ "status": "DELIVERED" }` | **200** |

**Crear pedido (paso 1):**

```json
{
  "furnitureType": "ARMARIO",
  "params": { "anchoCm": 120, "altoCm": 220, "profundidadCm": 60 },
  "notes": "QA 4.4 — flujo feliz"
}
```

**Líneas (paso 2)** — usa el mismo `materialId` en consume:

```json
{
  "lines": [
    { "materialId": "{{materialId}}", "plannedQty": 3 }
  ]
}
```

**Consumo real (paso 6)** — mismas cantidades que plan (ajusta si cambiaste `plannedQty`):

```json
{
  "lines": [
    { "materialId": "{{materialId}}", "actualQty": 3 }
  ]
}
```

### Hitos en base de datos (Prisma Studio)

| Tras paso | Comprobar |
| --------- | --------- |
| 4 — APPROVED | `order_reservations` con `active = true`; `stock_movements` tipo `RESERVE` |
| 6 — consume | `order_material_lines.actualQty` relleno; movimientos `OUT` + `RELEASE`; reservas `active = false` |
| 9 — DELIVERED | `orders.status` = `DELIVERED`; sin reservas activas para ese `orderId` |

### Comprobación extra (opcional)

| # | Request | Esperado |
| - | ------- | -------- |
| 10 | `GET /api/orders/{{orderId}}/movements` (WORKER) | **200**, lista con `RESERVE`, `OUT`, `RELEASE` del pedido |
| 11 | `GET /api/orders/{{orderId}}` (CLIENT dueño) | **200**, `status`: `DELIVERED` (vista cliente sin líneas de material) |

### Cierre sección 3

- [ ] Todos los `PATCH .../status` del flujo responden **200**
- [ ] Tras aprobar hay reservas activas; tras consumo en producción quedan inactivas
- [ ] Pedido termina en **DELIVERED**
- [ ] No hubo que cancelar ni saltar estados

---

## 4. Campos ML y timestamps por estado

Documentación: [docs/pedidos/datos-ml.md](../../docs/pedidos/datos-ml.md).

Tras el flujo feliz (§3) o cualquier secuencia de `PATCH .../status`:

- [ ] Ejecutaste migración: `npx prisma migrate deploy` (o `migrate dev` en local)
- [ ] En Prisma Studio → `order_status_events`: filas ordenadas por `changedAt` para tu `orderId`
- [ ] Evento inicial `DRAFT` al `POST /api/orders`
- [ ] Un evento por cada transición (`PENDING`, `APPROVED`, `IN_PRODUCTION`, `READY`, `DELIVERED`, etc.)
- [ ] Tabla `order_material_lines` con `plannedQty` y `actualQty` en pedido entregado

---

## 5. Nota Fase 2 IA (documentación)

- [ ] Existe [docs/pedidos/fase-2-ia.md](../../docs/pedidos/fase-2-ia.md) con la frase: sugerir BOM desde histórico de `DELIVERED`
- [ ] [docs/bom-templates.md](../../docs/bom-templates.md) enlaza al roadmap IA
- [ ] [docs/pedidos/datos-ml.md](../../docs/pedidos/datos-ml.md) enlaza a fase-2-ia

---

## 6. README — roles y pedidos

- [ ] [README.md](../../README.md) tiene sección **Pedidos y roles** con tabla CLIENT / WORKER / ADMIN
- [ ] README describe flujo `DRAFT` → `DELIVERED` y enlaces a docs de pedidos
- [ ] Rutas `/orders`, `/my-orders` documentadas; `/tasks` marcado como legacy
- [ ] [docs/seguridad/roles-permisos.md](../../docs/seguridad/roles-permisos.md) alineado con `/api/orders` y pedidos propios (**403**)
