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

*(Pendiente — paso 2 del plan)*

---

## 3. Flujo feliz (aprobar → reservar → producir → entregar)

*(Pendiente — paso 3 del plan)*
