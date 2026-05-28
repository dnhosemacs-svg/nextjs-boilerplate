# Checklist — Pedidos consumo real (tarjeta 4.1)

Verificación manual del flujo de consumo real en producción.

## Antes de empezar

- [ ] `npm run dev` en marcha (`http://localhost:3000`)
- [ ] Login OK en `/login` (usuario **ADMIN** o **WORKER**)
- [ ] Existe un pedido en `IN_PRODUCTION` con líneas planificadas y reservas activas
- [ ] Variable `cookie` = `next-auth.session-token=<valor del navegador>`
- [ ] Variable `orderId` = id de pedido en `IN_PRODUCTION`
- [ ] Tienes los `materialId` de las líneas del pedido

## Endpoint

`POST /api/orders/:id/consume`

Body:

```json
{
  "lines": [
    { "materialId": "mat-1", "actualQty": 1.5 },
    { "materialId": "mat-2", "actualQty": 3.0 }
  ]
}
```

## Casos felices

| # | Caso | Esperado |
| - | ---- | -------- |
| 1 | `actualQty == plannedQty` | **200**, crea `OUT` y `RELEASE` por cada línea, reservas quedan inactivas |
| 2 | `actualQty < plannedQty` | **200**, crea `OUT` con real menor y `RELEASE` de reserva activa |
| 3 | `actualQty > plannedQty` | **200**, permite operación y devuelve `consumption.warnings` |

## Casos de error

| # | Caso | Esperado |
| - | ---- | -------- |
| 4 | Pedido inexistente | **404** |
| 5 | Pedido no está en `IN_PRODUCTION` | **400** |
| 6 | Línea sin `actualQty` válida (<= 0) | **400** |
| 7 | Faltan materiales o no coinciden con líneas planificadas | **400** |

## Comprobaciones en BD (Prisma Studio)

- [ ] En `order_material_lines`, cada línea tiene `actualQty` informado
- [ ] En `stock_movements`, existen `OUT` y `RELEASE` para `orderId`
- [ ] En `order_reservations`, `active = false` para reservas del pedido
- [ ] En `materials.stock`, el físico refleja `IN - OUT + ADJUST` tras el consumo

## Cierre tarjeta 4.1

- [ ] Formulario visible solo en `IN_PRODUCTION`
- [ ] Confirmación registra consumo real por línea
- [ ] Se ejecuta `OUT + RELEASE` y cierre de reservas
- [ ] Exceso sobre plan permitido con aviso y log
- [ ] Stock disponible impactado correctamente
