# Deuda técnica — borrador de auditoría

Registro de deudas conocidas del proyecto. Cada entrada describe el problema, el impacto y la decisión tomada (sin resolver aún, salvo que se indique lo contrario).

---

## DT-002 — Duplicación `products` vs `materials` (API + UI)

| Campo | Valor |
|-------|-------|
| **Etiquetas** | `docs`, `deuda` |
| **Tarjeta** | 2.3 |
| **Estado** | Documentada — **no consolidar en esta fase** |
| **Fecha** | 2026-06-09 |

### Resumen

El dominio de inventario migró de «productos» a «materiales» (modelo Prisma `Material`), pero quedaron **dos familias de rutas API** y **nomenclatura heredada** en rutas de página, store y componentes. Ambas APIs CRUD básicas operan sobre la **misma tabla** `Material`; no hay modelo `Product` en base de datos.

### Rutas API duplicadas

| Operación | `/api/products` | `/api/materials` | ¿Duplicada? | Notas |
|-----------|-----------------|------------------|-------------|-------|
| Listar | `GET /api/products` | `GET /api/materials` | **Sí** | Misma lógica: `db.material.findMany`, validadores y serializer de material |
| Crear | `POST /api/products` | `POST /api/materials` | **Sí** | Mismo `createMaterialSchema` y `serializeMaterial` |
| Detalle | — | `GET /api/materials/:id` | No (solo materials) | `products` no expone GET por id |
| Actualizar | `PATCH /api/products/:id` | `PATCH /api/materials/:id` | **Sí** | Mismo `updateMaterialSchema`; pequeñas diferencias en mensajes 404 |
| Eliminar | `DELETE /api/products/:id` | `DELETE /api/materials/:id` | **Sí** | Misma operación sobre `db.material` |
| Stock (lectura) | — | `GET /api/materials/:id/stock` | No (solo materials) | Devuelve snapshot (`physical`, `reserved`, `available`) vía `stock-service` |
| Stock (escritura) | `PATCH /api/products/:id/stock` | — | Parcial | `products` actualiza `stock` directo; `materials` usa movimientos en otra ruta |
| Stock bajo | — | `GET /api/materials/low-stock` | No (solo materials) | Dashboard |
| Movimientos | — | `GET/POST /api/materials/:id/movements` | No (solo materials) | Historial y entradas/ajustes |

**Implementación duplicada (CRUD colección):**

- `src/app/api/products/route.ts`
- `src/app/api/materials/route.ts`

**Implementación duplicada (CRUD por id, sin GET en products):**

- `src/app/api/products/[id]/route.ts` — solo `PATCH`, `DELETE`
- `src/app/api/materials/[id]/route.ts` — `GET`, `PATCH`, `DELETE`

**Rutas exclusivas de `materials` (no tienen equivalente en `products`):**

- `src/app/api/materials/[id]/stock/route.ts`
- `src/app/api/materials/low-stock/route.ts`
- `src/app/api/materials/[id]/movements/route.ts`

**Ruta heredada de `products` (sin par en materials para PATCH stock):**

- `src/app/api/products/[id]/stock/route.ts`

### Qué usa la UI activa (`/products` → materiales)

La página visible en menú es **`/products`** con etiqueta **«Materiales»** (`src/lib/navigation.ts`). El componente montado es `ProductsView`, pero **todo el flujo activo llama a `/api/materials`**:

| Pieza UI | Archivo | API que consume |
|----------|---------|-----------------|
| Página | `src/app/(app)/products/page.tsx` | Renderiza `ProductsView` |
| Vista principal | `src/components/inventory/products-view.tsx` | Título «Materiales»; usa `MaterialList` + `MaterialForm` |
| Listado | `src/components/inventory/material-list.tsx` | `GET /api/materials`, `GET /api/materials/:id/stock`, `GET /api/materials/:id/movements` |
| Alta / edición | `src/components/inventory/material-form.tsx` | `POST /api/materials`, `PATCH /api/materials/:id` |
| Filtros búsqueda/categoría | `SearchBar`, `CategoryFilter` + `ui-store.productFilters` | Los filtros alimentan `useMaterialsQuery` (nombre legacy `productFilters`) |
| Widget stock bajo (dashboard) | `src/components/dashboard/low-stock-widget.tsx` | `GET /api/materials/low-stock`; enlace a `/products` |
| Líneas de material en pedidos | `src/components/orders/order-material-lines-editor.tsx` | `GET /api/materials` |

**Código legacy no montado en la UI activa** (sigue apuntando a `/api/products`):

| Pieza | Archivo | API |
|-------|---------|-----|
| `ProductList` | `src/components/inventory/product-list.tsx` | `GET /api/products` |
| `ProductForm` | `src/components/inventory/product-form.tsx` | `POST`, `PATCH /api/products` |
| `ProductCard` | `src/components/inventory/product-card.tsx` | `PATCH /api/products/:id/stock` |
| Hooks | `use-products-query`, `use-product-mutations`, `use-update-stock-mutation` | Cliente en `src/lib/inventory-api.ts` (funciones `getProducts`, `createProduct`, etc.) |

`ProductList` / `ProductForm` / `ProductCard` **no se importan** desde `ProductsView` ni desde ninguna ruta de app activa.

### Documentación desactualizada

- `docs/api.md` describe el contrato antiguo de **productos** (`price`, `description`, `PATCH stock` en products).
- `docs/state-management.md` referencia `useProductsQuery` y `GET /api/products` como flujo principal.
- Colección Postman (`tools/postman/carpinteria-api.postman_collection.json`) sigue centrada en `/api/products`.

Los tests de API activos cubren **`/api/materials`** (`src/app/api/materials/**/*.test.ts`), no `products`.

### Impacto

1. **Confusión de nombres:** ruta `/products`, store `productFilters`, tipos `Product` en cliente vs dominio real `Material`.
2. **Mantenimiento doble:** cambios en CRUD de materiales pueden requerir tocar dos route handlers idénticos.
3. **Riesgo de regresión:** clientes o demos que sigan usando `/api/products` obtienen el mismo dato con distinto contrato de validación en query (p. ej. `sortBy=price` en docs vs `unitCost` en materials).
4. **Docs y herramientas** no reflejan el camino canónico (`/api/materials`).

### Decisión (fase actual)

**No borrar ni consolidar en esta fase.** Mantener ambas familias de rutas hasta **después del video** de demostración, para no romper scripts, Postman o material grabado que aún cite `/api/products`.

### Plan de consolidación (posterior al video)

1. **Canónico:** `/api/materials` y ruta de página `/materials` (o renombrar `/products` → `/materials` con redirect).
2. **Eliminar** rutas `src/app/api/products/**` y funciones cliente `getProducts`, `createProduct`, etc.
3. **Eliminar** componentes/hooks legacy: `product-list`, `product-form`, `product-card`, validadores `product.ts` si ya no aplican.
4. **Renombrar** `productFilters` → `materialFilters` en `ui-store` y query keys.
5. **Actualizar** `docs/api.md`, Postman, README y `docs/state-management.md`.
6. Añadir redirect temporal `GET /api/products` → 410 o proxy a materials si hace falta periodo de gracia.

### Referencias rápidas

```
UI activa:     /products  →  ProductsView  →  /api/materials/*
API duplicada: /api/products/*  ≡  /api/materials/*  (CRUD básico, misma tabla Material)
Solo materials: stock snapshot, low-stock, movements
Legacy sin UI: ProductList, ProductForm, ProductCard  →  /api/products/*
```
