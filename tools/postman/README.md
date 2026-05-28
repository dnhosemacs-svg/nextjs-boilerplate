# Colección Postman — TaskFlow Carpintería

Archivos para importar en **Postman** o **Thunder Client** (ambos admiten importación Postman v2.1).

## Importar

1. Postman: **Import** → selecciona `carpinteria-api.postman_collection.json` y `carpinteria-api.postman_environment.json`.
2. Thunder Client: menú **Collections** → **Import** → elige la misma colección JSON.

## Verificación manual

Sigue el checklist paso a paso: [CHECKLIST.md](CHECKLIST.md) (21 requests; cubre **401**, felices, **400**, **404** y **409**).

**Stock / libro mayor (tarjeta 2.1):** [CHECKLIST-STOCK.md](CHECKLIST-STOCK.md) — carpeta `06 — Materials stock (2.1)`. Necesitas `materialId` (Prisma Studio) y, para OUT con pedido real, `orderId`.
**Materiales y movimientos (tarjeta 2.4):** [CHECKLIST-MATERIALS-MOVEMENTS.md](CHECKLIST-MATERIALS-MOVEMENTS.md) — carpeta `07 — Materials & movements (2.4)`.

## Sesión (obligatorio)

1. `npm run dev` e inicia sesión en `http://localhost:3000/login`.
2. DevTools → Cookies → copia el valor de `next-auth.session-token`.
3. En el entorno **Carpintería — local**, edita la variable `cookie`:
   - Formato: `next-auth.session-token=<valor copiado>`
4. Activa ese entorno antes de ejecutar requests.

## Carpetas y códigos esperados

| Carpeta | Qué cubre |
| ------- | --------- |
| `00 — Sesión` | Comprobar sesión; **401** sin cookie |
| `01 — Categories (felices)` | **200** / **201** / PATCH / DELETE OK |
| `02 — Categories (errores)` | **400**, **404**, **409** duplicado y **409** delete con productos |
| `03 — Products (felices)` | CRUD + stock |
| `04 — Products (errores)` | **400** query/body; **404** PATCH |
| `05 — Tasks (muestra auth)` | **200** con cookie; **401** sin cookie |
| `06 — Materials stock (2.1)` | GET stock; POST IN/OUT/ADJUST; **400** / **404** / **409** |
| `07 — Materials & movements (2.4)` | CRUD materiales; POST movements IN/ADJUST; GET movements; **400** / **401** / **403** / **404** |

Las subcarpetas **409** deben ejecutarse **en orden** (1 → 2 → 3). Algunos requests guardan `categoryId` / `productId` en variables con scripts de test.

## Seguridad

No subas a git un entorno exportado con tu cookie real. El JSON del repo usa un placeholder.
