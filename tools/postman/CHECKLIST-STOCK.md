# Checklist — Stock / libro mayor (tarjeta 2.1)

Verificación manual de `getMaterialStock` y `recordMovement` vía API.

## Antes de empezar

- [ ] `npm run dev` en marcha (`http://localhost:3000`)
- [ ] Base de datos con seed: `npx prisma db seed`
- [ ] Login OK en `/login` (usuario **ADMIN** o **WORKER**)
- [ ] Colección e entorno importados desde `tools/postman/`
- [ ] Variable `cookie` = `next-auth.session-token=<valor del navegador>`
- [ ] Variable `materialId` = id de un material (Prisma Studio → tabla `materials`, o copia del seed)
- [ ] Para pruebas de **OUT**: variable `orderId` = id de un pedido existente (Studio → `orders`; créalo si no hay ninguno)

## Carpeta Postman: `06 — Materials stock (2.1)`

Ejecuta en orden la subcarpeta **felices**, luego **errores**.

### Felices

| # | Request | Status | Qué comprobar |
| - | ------- | ------ | ------------- |
| 1 | GET material stock | **200** | `physical`, `reserved`, `available` como strings; tras seed, `physical` > 0 |
| 2 | POST movement IN (+5) | **201** | `stock.physical` sube 5 respecto al paso 1 |
| 3 | GET material stock (otra vez) | **200** | Coherente con el IN anterior |

### Errores

| # | Request | Status |
| - | ------- | ------ |
| 4 | GET stock id inexistente | **404** |
| 5 | POST ADJUST sin reason | **400** |
| 6 | POST OUT sin orderId | **400** |
| 7 | POST OUT orderId inexistente | **404** |
| 8 | POST OUT cantidad excesiva | **409** |

### Opcional (roles)

| Caso | Cómo | Esperado |
| ---- | ---- | -------- |
| ADJUST como WORKER | Cookie de usuario WORKER, POST ADJUST con reason | **403** |
| ADJUST como ADMIN | Cookie ADMIN, POST ADJUST `{ "type":"ADJUST", "quantity": -1, "reason": "Rotura prueba" }` | **201** |

## Comprobación de saldo (manual)

Tras IN +5 y sin reservas activas:

```
physical ≈ valor_inicial_seed + 5
reserved = 0 (si no creaste OrderReservation)
available = physical - reserved
```

En Prisma Studio, tabla `stock_movements`, debe haber al menos:

- 1 fila `IN` del seed (`Stock inicial (seed)`)
- 1 fila `IN` de la prueba Postman

## Si algo falla

- Cookie caducada → vuelve a login y actualiza `cookie`
- `physical` = 0 tras seed → vuelve a ejecutar `npx prisma db seed`
- `404` en material → revisa `materialId` (no uses `productId` de la carpeta Products)
- `409` en OUT → reduce `quantity` o aumenta stock con un IN previo

## Cierre tarjeta 2.1

- [ ] GET stock devuelve físico / reservado / disponible
- [ ] IN aumenta físico
- [ ] Errores 400 / 404 / 409 según tabla
- [ ] Movimientos visibles en `stock_movements`
