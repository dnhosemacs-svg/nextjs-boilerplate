# Checklist — Materiales y movimientos (tarjeta 2.4)

Verificación manual de APIs de materiales y movimientos (`IN`/`ADJUST`) vía Postman.

## Antes de empezar

- [ ] `npm run dev` en marcha (`http://localhost:3000`)
- [ ] Base de datos con seed: `npx prisma db seed`
- [ ] Login OK en `/login` (usuario **ADMIN** o **WORKER**)
- [ ] Colección y entorno importados desde `tools/postman/`
- [ ] Variable `cookie` = `next-auth.session-token=<valor del navegador>`
- [ ] Variable `categoryId` disponible (puedes usar una categoría creada en la carpeta Categories)

## Carpeta Postman: `07 — Materials & movements (2.4)`

Ejecuta primero `materials` y después `movements (IN/ADJUST)`.

### Materiales (felices)

| # | Request | Status | Qué comprobar |
| - | ------- | ------ | ------------- |
| 1 | GET materials | **200** | Devuelve array (puede venir vacío o con datos seed) |
| 2 | POST material | **201** | Crea material y guarda `materialId` en variables |
| 3 | GET material by id | **200** | Devuelve el material recién creado |
| 4 | PATCH material | **200** | Refleja el cambio enviado (p. ej. `location`) |
| 5 | DELETE material | **200** | Devuelve el material eliminado |

### Movimientos (felices)

> Ejecuta estos movimientos con un `materialId` existente (si eliminaste el material previo, crea otro).

| # | Request | Status | Qué comprobar |
| - | ------- | ------ | ------------- |
| 6 | POST movement IN (+5) | **201** | Devuelve `movement` + `stock` actualizado |
| 7 | POST movement ADJUST (+1) | **201** | Requiere `reason`; ajusta stock físico |
| 8 | GET movements by material | **200** | Lista movimientos ordenados por fecha desc |

### Errores recomendados

| # | Request sugerido | Status esperado |
| - | ---------------- | --------------- |
| 9 | GET material by id con `{{fakeId}}` | **404** |
| 10 | POST movement tipo `OUT` | **400** |
| 11 | POST ADJUST sin `reason` | **400** |
| 12 | POST/PATCH/DELETE material con rol WORKER | **403** |
| 13 | GETs sin cookie | **401** |

## Cierre tarjeta 2.4

- [ ] CRUD de materiales funcionando según contrato
- [ ] `POST /api/materials/:id/movements` admite `IN` y `ADJUST`
- [ ] `GET /api/materials/:id/movements` devuelve histórico
- [ ] Restricciones por rol verificadas (ADMIN/WORKER)
