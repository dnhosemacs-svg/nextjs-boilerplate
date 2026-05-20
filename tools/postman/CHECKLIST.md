# Checklist — Verificación manual (tarjeta 3.3)

Marca cada ítem tras ejecutarlo en **Postman** o **Thunder Client** con la colección importada.

## Antes de empezar

- [ ] `npm run dev` en marcha (`http://localhost:3000`)
- [ ] Usuario creado y login OK en `/login`
- [ ] Colección e entorno importados desde esta carpeta
- [ ] Variable `cookie` del entorno = `next-auth.session-token=<valor copiado del navegador>`
- [ ] Entorno **Carpintería — local** activo en Postman / Thunder Client

## 1. Sesión

| # | Request (carpeta `00 — Sesión`) | Status esperado |
| - | ------------------------------- | --------------- |
| 1 | GET session (comprobar login) | **200** (body con `user` si hay sesión) |
| 2 | 401 — GET categories sin cookie | **401** + `"No autenticado"` |

## 2. Categories — felices

Carpeta `01 — Categories (felices)` — **ejecutar en orden**:

| # | Request | Status esperado |
| - | ------- | --------------- |
| 3 | 200 — GET categories | **200** |
| 4 | 201 — POST category | **201** (guarda `categoryId` en variables) |
| 5 | 200 — PATCH category | **200** |
| 6 | 200 — DELETE category (sin productos) | **200** |

## 3. Categories — errores

Carpeta `02 — Categories (errores)`:

| # | Request | Status esperado |
| - | ------- | --------------- |
| 7 | 400 — POST category name vacío | **400** |
| 8 | 404 — PATCH category id inexistente | **404** |
| 9 | 404 — DELETE category id inexistente | **404** |
| 10 | 409 — POST duplicado (pasos 1 → 2) | 1.º **201**, 2.º **409** |
| 11 | 409 — DELETE con productos (pasos 1 → 2 → 3) | 1.º **201**, 2.º **201**, 3.º **409** |

## 4. Products

**Felices** (`03 — Products (felices)`): antes del POST producto, vuelve a ejecutar **201 — POST category** si `categoryId` está vacío.

| # | Request | Status esperado |
| - | ------- | --------------- |
| 12 | 200 — GET products | **200** |
| 13 | 201 — POST product | **201** |
| 14 | 200 — PATCH product | **200** |
| 15 | 200 — PATCH stock | **200** |
| 16 | 200 — DELETE product | **200** |

**Errores** (`04 — Products (errores)`):

| # | Request | Status esperado |
| - | ------- | --------------- |
| 17 | 400 — GET products sortBy inválido | **400** |
| 18 | 400 — POST product categoryId inexistente | **400** |
| 19 | 404 — PATCH product id inexistente | **404** |

## 5. Tasks (muestra)

Carpeta `05 — Tasks (muestra auth)`:

| # | Request | Status esperado |
| - | ------- | --------------- |
| 20 | 200 — GET tasks | **200** |
| 21 | 401 — GET tasks sin cookie | **401** |

## Cierre tarjeta 3.3

- [ ] Todos los status de la tabla coinciden con lo esperado
- [ ] Cookie de sesión documentada en README (paso 1)
- [ ] Colección versionada en `tools/postman/` (paso 2)
- [ ] README enlaza la colección (paso 3)

Si algo falla: revisa que la cookie no haya caducado (vuelve a login y copia de nuevo) y que la base de datos esté accesible (Prisma / `.env.local`).
