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
- Tras recargar la página, el sidebar puede recuperar abierto/cerrado.
- `productFilters` se reinician al F5 (comportamiento deseado para la demo del ejercicio).

> **Nota:** el shell privado debe leer `sidebarOpen` desde el store para que el persist sea visible (paso 2 de la tarjeta 4.4).

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

Implementación API (paso 4 de la tarjeta): `PATCH /api/products/:id/stock` devuelve 500 cuando la variable de entorno está activa.

Desactivar `DEMO_STOCK_500` antes de desplegar a producción.

---

## React Query DevTools — fresh / stale / fetching

Montado solo en desarrollo en `src/components/providers.tsx` (`ReactQueryDevtools`).

### Pasos manuales

1. `npm run dev`, inicia sesión y abre `/products`.
2. Abre el panel flotante de React Query DevTools (esquina inferior).
3. Pestaña **Queries** → localiza `["products","list", { …filtros }]`.

| Escenario | Cómo provocarlo | Qué ver |
|-----------|-----------------|--------|
| **fresh** | Entrar en `/products` tras carga exitosa | Badge fresh (~2 min) |
| **stale** | Esperar >2 min o clic derecho → **Invalidate** | Badge stale; datos aún visibles |
| **fetching** | Con query stale: refocus de ventana o **Refetch** | Badge fetching + «Actualizando…» en la lista |

### Entrega

Adjunta capturas del panel DevTools con la query de productos en cada estado y una línea que explique fresh / stale / fetching.

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
