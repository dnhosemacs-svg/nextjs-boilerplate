# Checklist — Pedidos QA (tarjeta 4.4)

Verificación manual de seguridad, flujo y preparación IA.

## Antes de empezar

- [ ] `npm run dev` en marcha (`http://localhost:3000`)
- [ ] Dos usuarios **CLIENT** distintos (A y B) con sesión en Firebase + fila en `users`
- [ ] Usuario **WORKER** o **ADMIN** para pasos de taller (pasos 2–3)
- [ ] Variable `cookie` = `next-auth.session-token=<valor del navegador>`
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

*(Pendiente — paso 3 del plan)*
