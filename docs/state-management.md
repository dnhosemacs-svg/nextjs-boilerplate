# Gestión de estado (inventario)

Documento de la tarjeta **4.4**: cómo se reparte el estado entre la UI del navegador y los datos del servidor en el módulo de inventario.

## Resumen

| Tipo | Herramienta | Qué guarda | Ejemplo en inventario |
|------|-------------|------------|------------------------|
| Servidor | TanStack Query | Respuestas de `/api/*` en caché | Lista de productos, categorías |
| UI (sesión) | Zustand | Preferencias de interfaz en memoria | Filtros de búsqueda, orden |
| UI (persistente) | Zustand + `persist` | Solo lo acordado en `localStorage` | `sidebarOpen` |

**Regla:** no duplicar en Zustand lo que ya viene del servidor. Los filtros viven en Zustand; la lista de productos vive en Query.

---

## UI vs servidor (ejemplos inventario)

### Estado de UI — Zustand (`src/stores/ui-store.ts`)

| Campo | Uso |
|-------|-----|
| `sidebarOpen` | Panel lateral abierto/cerrado (móvil) |
| `productFilters` | `search`, `categoryId`, `sortBy`, `sortOrder` |

Los filtros **no** se guardan en `localStorage` (solo el sidebar, ver más abajo).

**Flujo filtros → API:**

1. `SearchBar` y `CategoryFilter` llaman `setProductFilters` con un parche parcial.
2. `useProductsQuery` lee `productFilters` del store.
3. La query key incluye esos filtros (`queryKeys.products.list(filters)`).
4. TanStack Query ejecuta `GET /api/products?search=…&categoryId=…` cuando cambia la key.

Archivos implicados:

- `src/components/inventory/search-bar.tsx` — búsqueda con debounce → `productFilters.search`
- `src/components/inventory/category-filter.tsx` — `productFilters.categoryId`
- `src/hooks/inventory/use-products-query.ts` — puente Zustand → Query

### Estado de servidor — TanStack Query

| Hook | Endpoint | Rol |
|------|----------|-----|
| `useProductsQuery` | `GET /api/products` | Listado filtrado |
| `useCategoriesQuery` | `GET /api/categories` | Select de categorías |
| `useUpdateStockMutation` | `PATCH /api/products/:id/stock` | Stock con actualización optimista |
| `useCreateProductMutation`, etc. | `POST` / `PATCH` / `DELETE` | CRUD + `invalidateQueries` |

La capa `src/lib/inventory-api.ts` hace el `fetch`; los hooks no guardan copias en Zustand.

### Anti-patrón

❌ Guardar `Product[]` en Zustand después del fetch.  
✅ Dejar la lista en Query; Zustand solo para UI que no existe en la base de datos.

---

## Zustand `persist` (solo sidebar)

En `src/stores/ui-store.ts`:

```ts
persist(
  /* state */,
  {
    name: "carpinteria-ui",
    partialize: (state) => ({ sidebarOpen: state.sidebarOpen }),
  },
)
```

- Clave en `localStorage`: `carpinteria-ui`.
- Tras recargar la página, el sidebar puede recuperar abierto/cerrado (`private-shell.tsx` usa `useUiStore`).
- `productFilters` se reinician al F5 (comportamiento deseado para la demo del ejercicio).

---

## `staleTime` vs `gcTime`

Configuración global en `src/lib/query-client.ts`:

| Opción | Valor | Significado |
|--------|-------|-------------|
| `staleTime` | 2 min | Tiempo en que los datos se consideran *fresh*; menos refetch automático |
| `gcTime` | 10 min | Tiempo que la caché permanece en memoria tras desmontar el último observer |

Override en categorías (`src/hooks/inventory/use-categories-query.ts`): `staleTime: 10 min` porque las categorías cambian con menos frecuencia que el listado de productos.

### Estados en React Query

| Estado | Cuándo ocurre |
|--------|----------------|
| **fresh** | Dentro de `staleTime` desde el último fetch exitoso |
| **stale** | Pasado `staleTime`; los datos siguen en pantalla pero Query puede refetch |
| **fetching** | Hay una petición HTTP en curso (carga inicial o refetch en background) |

En UI, `product-list.tsx` muestra «Actualizando…» cuando `isFetching && !isLoading`.

---

## Demo: error 500 en stock + rollback en UI

Objetivo: ver actualización optimista y reversión si el servidor falla.

1. Activar en `.env.local`: `DEMO_STOCK_500=true` (ver `.env.example`).
2. En `/products`, pulsar **+** o **−** en el stock de un producto.
3. La UI cambia al instante (`onMutate` en `use-update-stock-mutation.ts`).
4. La API responde 500 → `onError` restaura snapshots → el número vuelve al valor anterior.
5. `product-card.tsx` muestra el mensaje de error de la mutación.

La API (`PATCH /api/products/:id/stock`) devuelve 500 cuando `DEMO_STOCK_500=true`.

Desactivar `DEMO_STOCK_500` antes de desplegar a producción.

---

## React Query DevTools — fresh / stale / fetching

Solo en desarrollo: `ReactQueryDevtools` en `src/components/providers.tsx` (icono flotante abajo a la izquierda tras `npm run dev`).

### Preparación

1. `npm run dev`
2. Inicia sesión en `/login`
3. Abre `/products` y espera a que cargue el listado (sin skeleton)

### Encontrar la query correcta

1. Abre **TanStack Query DevTools** (logo de React Query).
2. Pestaña **Queries**.
3. Busca una fila cuya key empiece por `products` → `list` → objeto con filtros, por ejemplo:

   ```json
   ["products", "list", { "sortBy": "name", "sortOrder": "asc" }]
   ```

4. Haz clic en esa fila para ver el detalle: `dataUpdatedAt`, `fetchStatus`, observers, etc.

### Correspondencia DevTools ↔ código

| En DevTools | En el hook `useProductsQuery` / `product-list` |
|-------------|--------------------------------------------------|
| Estado **fresh** | Datos dentro de `staleTime` (2 min); `isLoading === false` |
| Estado **stale** | Pasado `staleTime`; la lista sigue visible con `data` |
| **fetching** / `fetchStatus: 'fetching'` | `isFetching === true` |
| Primera visita sin caché | `isLoading === true` → skeleton en `product-list.tsx` |
| Refetch en background | `isFetching && !isLoading` → texto «Actualizando…» |

---

### Escenario 1 — **fresh**

**Objetivo:** datos recién obtenidos; Query no necesita volver a pedirlos todavía.

1. Entra en `/products` (o recarga estando ya ahí).
2. Cuando desaparezca el skeleton, abre DevTools.
3. La query de productos debe mostrarse como **fresh** (badge verde / indicador fresh según versión del panel).

**Qué significa:** el último `GET /api/products` fue hace menos de 2 minutos (`DEFAULT_STALE_TIME_MS`). Cambiar de pestaña del navegador y volver no debería disparar refetch mientras siga fresh.

**Captura sugerida:** panel DevTools con la query `products` / `list` en estado fresh + listado visible en la página.

---

### Escenario 2 — **stale**

**Objetivo:** los datos siguen en pantalla pero Query ya los considera desactualizados.

**Opción A (rápida):**

1. Con la query de productos seleccionada en DevTools, menú contextual → **Invalidate** (o botón equivalente).
2. La query pasa a **stale**. El listado **no** desaparece.

**Opción B (realista):**

1. Deja `/products` abierta más de **2 minutos** sin tocar filtros.
2. Vuelve a abrir DevTools: debería estar **stale**.

**Qué significa:** Query puede refetch en el próximo refocus, remount o invalidación, pero la UI sigue mostrando la caché hasta que llegue respuesta nueva.

**Captura sugerida:** misma query en estado stale; productos aún visibles detrás del panel.

---

### Escenario 3 — **fetching**

**Objetivo:** hay una petición HTTP en curso mientras ya hay datos en caché.

1. Asegúrate de que la query de productos esté **stale** (escenario 2).
2. Provoca refetch de una de estas formas:
   - DevTools → **Refetch** en esa query, o
   - Cambia a otra pestaña del navegador 2–3 s y vuelve a la app (refetch on window focus, si aplica), o
   - Cambia un filtro (búsqueda/categoría) y vuelve al valor anterior (nueva key = nuevo fetch; para la misma key usa Refetch).
3. Durante la petición verás **fetching** en DevTools.
4. En la página, si ya había datos: aparece **«Actualizando…»** arriba del grid (`product-list.tsx`).

**Qué significa:** `isFetching` es true; puede coexistir con datos en pantalla (no confundir con `isLoading`, que solo aplica cuando no hay datos previos).

**Captura sugerida:** DevTools en fetching + texto «Actualizando…» visible en `/products`.

---

### Plantilla de nota para entrega (Trello / informe)

Copia y rellena tras las tres capturas:

```text
Query observada: ["products", "list", { ...filtros }]

- fresh: Tras cargar /products, la query permanece fresh 2 min (staleTime global).
  Los datos no se vuelven a pedir al cambiar de pestaña mientras siga fresh.

- stale: Tras invalidate (o >2 min), la query pasa a stale pero el listado sigue en UI.
  Query marca los datos como candidatos a refetch.

- fetching: Con la query stale, al refetch se ve fetching en DevTools y "Actualizando…"
  en product-list (isFetching && !isLoading).
```

---

### Checklist tarjeta 4.4

- [ ] `docs/state-management.md` + enlace en README
- [ ] Sidebar conectado a Zustand (`private-shell.tsx`)
- [ ] `staleTime` / `gcTime` documentados en código y doc
- [ ] Demo `DEMO_STOCK_500` probada con rollback visible
- [ ] Tres capturas DevTools (fresh, stale, fetching) + nota de la plantilla

---

## Archivos clave

| Archivo | Rol |
|---------|-----|
| `src/stores/ui-store.ts` | UI + `persist` del sidebar |
| `src/lib/query-client.ts` | Defaults `staleTime` / `gcTime` |
| `src/lib/query-keys.ts` | Claves de caché |
| `src/hooks/inventory/use-products-query.ts` | Filtros → fetch productos |
| `src/hooks/inventory/use-update-stock-mutation.ts` | Optimistic update + rollback |
| `src/app/api/products/[id]/stock/route.ts` | Endpoint de stock (demo 500) |
| `src/components/providers.tsx` | `QueryClientProvider` + DevTools |
