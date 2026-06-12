# Auditoría de deuda técnica

**Tarjeta 5.2** — Entregable `docs`  
**Proyecto:** TaskFlow Carpintería  
**Fecha:** 2026-06-12

Registro de problemas detectados durante el desarrollo: qué impacto tuvieron, cómo se resolvieron (o por qué se dejaron abiertos) y reflexiones para un proyecto nuevo.

---

## Checklist tarjeta 5.2

- [x] Listar problemas encontrados
- [x] Cómo se resolvió cada uno
- [x] Reflexión: error más frecuente
- [x] Reflexión: qué harías distinto en proyecto nuevo
- [x] Incluir `products`/`materials`, N+1 stock, Pusher no implementado

---

## Resumen ejecutivo

| ID | Problema | Estado | Resolución en una línea |
|----|----------|--------|-------------------------|
| P-01 | Cálculo de stock impreciso (`number` / float) | **Resuelto** | `Prisma.Decimal` + `stock-service.ts` + tests Vitest |
| P-02 | Confusión `DATABASE_URL` vs `DIRECT_URL` (Neon) | **Resuelto** | Dos URLs documentadas; CLI en `prisma.config.ts` → `DIRECT_URL` |
| P-03 | Auth solo en cliente (flash / bypass API) | **Resuelto** | `src/proxy.ts` + `requireApiSession` / `requireRole` en handlers |
| P-04 | Stock sin trazabilidad (campo único) | **Resuelto** | Libro mayor `StockMovement` + reservas `order_reservations` |
| P-05 | Migración dominio Product → Material | **Parcial** | UI activa en `/api/materials`; legacy `/api/products` (DT-002) |
| DT-001 | N+1 de stock en listado | **Mitigado** | `useQueries` en paralelo; falta endpoint batch (deuda abierta) |
| DT-002 | Duplicación `products` vs `materials` | **Abierto** | Documentado; consolidación aplazada |
| DT-003 | Sin tiempo real (Pusher / WebSockets) | **Abierto** | Roadmap; refetch manual entre pestañas |

---

## Problemas resueltos

### P-01 — Precisión decimal en costes y stock

**Síntoma:** Sumar cantidades con `number` de JavaScript producía errores de redondeo (`0.1 + 0.2 ≠ 0.3`). En inventario eso se traduce en disponible incorrecto y pedidos aprobados sin material real.

**Cómo se resolvió:**

- Tipos `Decimal` en Prisma (`@db.Decimal(10,2)` para `unitCost`, `Decimal(12,3)` para stock).
- Lógica centralizada en `src/lib/stock-service.ts` con `Prisma.Decimal` en agregados.
- Tests en `src/lib/stock-service.test.ts` que mockean Prisma y comprueban físico / reservado / disponible con la misma precisión que producción.

**Referencias:** [docs/arquitectura.md](../arquitectura.md#decimal-vs-float-en-costes-y-stock), `src/lib/stock-service.ts`.

---

### P-02 — URLs de Neon intercambiadas (pooler vs directo)

**Síntoma:** Migraciones Prisma fallaban o la app en Vercel agotaba conexiones (`too many connections`) al usar la URL equivocada.

**Cómo se resolvió:**

- `DATABASE_URL` → runtime con **pooling ON** (`src/lib/db.ts`).
- `DIRECT_URL` → CLI Prisma con **pooling OFF** (`prisma.config.ts`).
- Documentación en README, `.env.example` y [ADR-001](../adr/001-neon-prisma-serverless.md).

---

### P-03 — Rutas y APIs protegidas solo en React

**Síntoma:** Un usuario sin sesión podía ver un flash de UI privada o llamar APIs con `curl` si el handler no comprobara token.

**Cómo se resolvió:**

- Primera línea de defensa en `src/proxy.ts` (equivalente al middleware en Next.js 16): redirect a `/login` en páginas privadas y `401` JSON en APIs sensibles (`src/lib/protected-api-routes.ts`).
- Segunda línea en cada Route Handler con `requireApiSession()` / `requireRole()`.
- Scripts de verificación: `npm run verify:auth`, `verify-middleware`, `verify-api-auth`.

**Referencias:** [ADR-003](../adr/003-auth-serverless-proxy-nextauth-firebase.md), [docs/seguridad/middleware.md](../seguridad/middleware.md).

---

### P-04 — Stock como número editable sin historial

**Síntoma:** Un `PATCH` directo al campo `stock` no dejaba auditoría ni encajaba con reservas de pedidos.

**Cómo se resolvió:**

- Modelo de libro mayor: movimientos `IN`, `OUT`, `ADJUST` en `stock_movements`.
- Reservas activas en `order_reservations` al aprobar pedidos.
- Snapshot derivado: **físico** (movimientos), **reservado** (suma reservas), **disponible** = físico − reservado.
- API de lectura: `GET /api/materials/:id/stock`; escritura vía `POST /api/materials/:id/movements`.

**Referencias:** `src/lib/stock-service.ts`, [docs/pedidos/flujo-estados.md](../pedidos/flujo-estados.md).

---

### P-05 — Renombrado de dominio Product → Material (parcial)

**Síntoma:** El taller piensa en «materiales» (tableros, tornillos, barniz), no en «productos» de catálogo.

**Cómo se resolvió (parcialmente):**

- Modelo Prisma `Material` con unidades (`M`, `M2`, `UD`, `L`, `KG`) y `unitCost`.
- UI activa (`ProductsView` → `MaterialList`) consume **`/api/materials`** exclusivamente.
- Tests de API centrados en `src/app/api/materials/**/*.test.ts`.

**Qué quedó pendiente:** ver **DT-002** (rutas legacy, nombres `productFilters`, docs y Postman).

---

## Deuda abierta (documentada a propósito)

### DT-001 — N+1 de stock en el listado de materiales

| Campo | Valor |
|-------|-------|
| **Etiquetas** | `docs`, `deuda`, `rendimiento` |
| **Estado** | Mitigado en cliente; **sin endpoint batch** |
| **Fecha** | 2026-06-12 |

#### Problema

Tras `GET /api/materials` (1 request), la tabla necesita físico, reservado y disponible por fila. El diseño actual dispara **una petición HTTP por material**:

```56:62:src/components/inventory/material-list.tsx
  const stockQueries = useQueries({
    queries: materials.map((material) => ({
      queryKey: [...queryKeys.materials.all, "stock", material.id] as const,
      queryFn: () => getMaterialStock(material.id),
      staleTime: 30_000,
    })),
  });
```

Con 50 materiales → 1 + 50 round trips a Vercel/Neon. En el servidor, el widget de stock bajo repite el patrón en serie:

```20:22:src/lib/dashboard-queries.ts
  for (const material of materials) {
    const stock = await getMaterialStock(material.id);
```

Cada `getMaterialStock` ejecuta 4 agregados en paralelo (`Promise.all` en `computeMaterialStockDecimal`), así que **dentro de una llamada no hay N+1 SQL**, pero el coste escala linealmente con el número de materiales.

#### Cómo se mitigó (sin cerrar la deuda)

| Capa | Medida |
|------|--------|
| Cliente | `useQueries` lanza peticiones en **paralelo** (no en serie). |
| Cliente | `staleTime: 30_000` evita refetch agresivo al re-renderizar. |
| Servidor | Agregados por material en un solo `getMaterialStock` (4 queries, no 4×movimientos). |
| Tests | Cobertura de snapshot en `materials/[id]/stock/route.test.ts` y `stock-service.test.ts`. |

#### Resolución pendiente (plan)

1. Añadir `GET /api/materials?includeStock=true` o `POST /api/materials/stock-snapshot` con lista de ids.
2. Refactorizar `listLowStockMaterials()` a una sola query SQL o CTE que filtre `available < minStock`.
3. Invalidar una sola query key tras mutaciones de stock.

**Impacto actual:** Aceptable para el MVP del taller (decenas de materiales). Riesgo en catálogos grandes o cold starts frecuentes en Vercel.

---

### DT-002 — Duplicación `products` vs `materials` (API + UI)

| Campo | Valor |
|-------|-------|
| **Etiquetas** | `docs`, `deuda` |
| **Tarjeta origen** | 2.3 |
| **Estado** | Documentada — **no consolidar en esta fase** |
| **Fecha** | 2026-06-09 |

#### Resumen

El dominio de inventario migró de «productos» a «materiales» (modelo Prisma `Material`), pero quedaron **dos familias de rutas API** y **nomenclatura heredada** en rutas de página, store y componentes. Ambas APIs CRUD básicas operan sobre la **misma tabla** `Material`; no hay modelo `Product` en base de datos.

#### Rutas API duplicadas

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

#### Qué usa la UI activa (`/products` → materiales)

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

#### Documentación desactualizada

- `docs/api.md` describe el contrato antiguo de **productos** (`price`, `description`, `PATCH stock` en products).
- `docs/state-management.md` referencia `useProductsQuery` y `GET /api/products` como flujo principal.
- Colección Postman (`tools/postman/carpinteria-api.postman_collection.json`) sigue centrada en `/api/products`.

Los tests de API activos cubren **`/api/materials`** (`src/app/api/materials/**/*.test.ts`), no `products`.

#### Impacto

1. **Confusión de nombres:** ruta `/products`, store `productFilters`, tipos `Product` en cliente vs dominio real `Material`.
2. **Mantenimiento doble:** cambios en CRUD de materiales pueden requerir tocar dos route handlers idénticos.
3. **Riesgo de regresión:** clientes o demos que sigan usando `/api/products` obtienen el mismo dato con distinto contrato de validación en query (p. ej. `sortBy=price` en docs vs `unitCost` en materials).
4. **Docs y herramientas** no reflejan el camino canónico (`/api/materials`).

#### Decisión (fase actual)

**No borrar ni consolidar en esta fase.** Mantener ambas familias de rutas para no romper scripts, Postman o material grabado que aún cite `/api/products`.

#### Plan de consolidación

1. **Canónico:** `/api/materials` y ruta de página `/materials` (o renombrar `/products` → `/materials` con redirect).
2. **Eliminar** rutas `src/app/api/products/**` y funciones cliente `getProducts`, `createProduct`, etc.
3. **Eliminar** componentes/hooks legacy: `product-list`, `product-form`, `product-card`, validadores `product.ts` si ya no aplican.
4. **Renombrar** `productFilters` → `materialFilters` en `ui-store` y query keys.
5. **Actualizar** `docs/api.md`, Postman, README y `docs/state-management.md`.
6. Añadir redirect temporal `GET /api/products` → 410 o proxy a materials si hace falta periodo de gracia.

#### Referencias rápidas

```
UI activa:     /products  →  ProductsView  →  /api/materials/*
API duplicada: /api/products/*  ≡  /api/materials/*  (CRUD básico, misma tabla Material)
Solo materials: stock snapshot, low-stock, movements
Legacy sin UI: ProductList, ProductForm, ProductCard  →  /api/products/*
```

---

### DT-003 — Tiempo real no implementado (Pusher / WebSockets)

| Campo | Valor |
|-------|-------|
| **Etiquetas** | `docs`, `deuda`, `roadmap` |
| **Estado** | **No implementado** — documentado como limitación |
| **Fecha** | 2026-06-12 |

#### Problema

Varios operarios o pestañas del mismo usuario no ven cambios de stock al instante. Tras editar el físico de un material en la pestaña A, la pestaña B muestra el valor antiguo hasta **F5** o hasta que TanStack Query invalide y refetch.

Esto **no es un bug de persistencia**: Neon guarda bien el movimiento. Es ausencia de **push** servidor → cliente.

#### Evidencia en el proyecto

- No hay dependencia `pusher` ni variables `PUSHER_*` en `package.json` / `.env.example`.
- El README y el guión del vídeo lo declaran explícitamente como limitación.
- Los diagramas muestran Pusher con línea punteada «futuro» (`docs/video/diagrama-arquitectura.md`, `docs/arquitectura/diagrama.mmd`).

#### Cómo se «resolvió» (decisión consciente de no implementar en v1)

| Alternativa evaluada | Decisión |
|---------------------|----------|
| Pusher / Ably | Roadmap; coste y alcance fuera del MVP |
| WebSockets en Route Handler | Complejidad en serverless (conexiones largas) |
| Polling agresivo | Descartado (carga innecesaria en Neon) |
| **Refetch manual + invalidación local** | **Elegido para v1** |

Flujo actual: request–response → Query cachea → mutación exitosa invalida keys en **esa** pestaña.

#### Plan futuro (si el taller crece)

1. Canal `stock-updated` en Pusher (o SSE) emitido desde `recordMovement` / transiciones de pedido.
2. Cliente suscrito en `MaterialList` → `queryClient.invalidateQueries` al recibir evento.
3. Mantener la fuente de verdad en Postgres; el push solo invalida caché.

**Referencias:** [README — Limitaciones conocidas](../../README.md#limitaciones-conocidas), [ADR-002](../adr/002-tanstack-query-zustand-inventario.md) (consecuencia negativa: sin tiempo real).

---

## Reflexión: error más frecuente

El patrón que más veces generó confusión o retrabajo fue **mezclar capas o nombres del dominio antiguo con el nuevo**:

1. **`products` vs `materials`** — Llamar a `/api/products` desde un componente nuevo mientras la UI canónica ya usa `/api/materials`; o asumir que `/products` en la URL implica el modelo `Product`.
2. **`DATABASE_URL` vs `DIRECT_URL`** — Ejecutar `prisma migrate` contra el pooler o desplegar la app solo con la URL directa.
3. **Caché de Query vs bug de datos** — Ver dos pestañas desincronizadas y pensar que el stock no se guardó, cuando en realidad falta tiempo real (DT-003).
4. **`number` vs `Decimal`** — Serializar stock como número JS en tests o en la UI y obtener comparaciones `available < minStock` incorrectas.

En conjunto: **asumir que dos cosas con nombre parecido son la misma** (ruta, API, tipo o variable de entorno) sin mirar el camino canónico documentado.

---

## Reflexión: qué haría distinto en un proyecto nuevo

| Área | En este proyecto | En proyecto nuevo |
|------|------------------|-------------------|
| **Nomenclatura** | Migración gradual Product → Material dejó DT-002 | Renombrar dominio, rutas API y carpeta de página **en el mismo PR** antes de publicar |
| **Stock en listados** | N peticiones `/stock` por material (DT-001) | Diseñar desde el día 1 `includeStock` o vista SQL materializada |
| **Tiempo real** | Aplazado (DT-003) | Si hay multi-usuario en almacén, reservar slot para Pusher/SSE en la arquitectura inicial |
| **Auth** | Firebase + NextAuth + Postgres roles | Mantendría la separación, pero unificaría la doc de «un solo flujo de login» antes de añadir OAuth |
| **Deuda** | Registro en este archivo tras el hecho | ADR o entrada DT **antes** de duplicar código (p. ej. no crear `/api/products` si ya existe `materials`) |
| **Tests** | Tests de stock antes de cerrar pedidos | Contrato de API primero (OpenAPI o colección Postman canónica) alineada con `/api/materials` |

La lección principal: **el coste bajo a corto plazo de mantener legacy (`/api/products`) se convierte en coste cognitivo permanente** hasta la consolidación. En un greenfield, ese trade-off no lo aceptaría.

---

## Otras limitaciones (no deuda de implementación)

Documentadas en README; no bloquean la entrega v1:

- **Tasks legacy** en cookie (`/api/tasks`) — operativa real en `/api/orders`.
- **IA / BOM automático** — plantillas manuales; [fase-2-ia](../pedidos/fase-2-ia.md).
- **Admin usuarios** — requiere Firebase Admin en servidor.

---

## Referencias cruzadas

- [ADR-001 — Neon + Prisma](../adr/001-neon-prisma-serverless.md)
- [ADR-002 — TanStack Query + Zustand](../adr/002-tanstack-query-zustand-inventario.md)
- [ADR-003 — Auth serverless](../adr/003-auth-serverless-proxy-nextauth-firebase.md)
- [Arquitectura](../arquitectura.md)
- [Reflexión final (tarjeta 5.3)](../portfolio/reflexion-final.md)
