# ADR-002: TanStack Query + Zustand en el módulo de inventario

- **Estado:** Aceptado
- **Fecha:** 2026-06-12
- **Ámbito:** Cliente — `/products`, `/categories` y hooks en `src/hooks/inventory/`

## Contexto

El inventario necesita:

- Listados y CRUD contra `/api/materials` y `/api/categories` con estados de carga, error y revalidación.
- Filtros de UI (búsqueda, categoría, orden) que cambian la query sin duplicar datos en memoria.
- Preferencias de interfaz (sidebar) que pueden persistir entre recargas.

Mezclar todo en `useState` o en un único store global genera duplicación servidor/cliente y bugs de sincronización.

## Decisión

Separar responsabilidades:

| Capa | Herramienta | Qué guarda |
|------|-------------|------------|
| **Datos del servidor** | TanStack Query (`@tanstack/react-query`) | Respuestas de API, caché, `invalidateQueries` tras mutaciones |
| **Estado de UI** | Zustand (`src/stores/ui-store.ts`) | `productFilters`, `sidebarOpen` |

Regla: **no copiar listas de materiales/categorías en Zustand**.

Flujo de filtros:

1. `SearchBar` / filtros → `setProductFilters` (Zustand).
2. `useProductsQuery` lee filtros y arma `queryKey` con ellos.
3. TanStack Query hace `GET /api/materials?...` cuando cambia la key.

Persistencia: solo `sidebarOpen` vía `persist` + `localStorage` (`carpinteria-ui`); los filtros se reinician al F5.

Provider global: `src/components/providers.tsx` (`QueryClientProvider` + `SessionProvider`).

## Consecuencias

### Positivas

- Caché, deduplicación y estados `isLoading` / `isError` sin boilerplate manual.
- Mutaciones con invalidación centralizada (`use-category-mutations.ts`, `use-update-stock-mutation.ts`, etc.).
- Zustand ligero para UI sin Redux ni Context profundo.

### Negativas

- Dos conceptos que el equipo debe distinguir (Query vs Zustand).
- Sin tiempo real: otra pestaña no ve cambios hasta refetch manual (F5 o `invalidateQueries`).

## Alternativas consideradas

| Alternativa | Por qué no |
|-------------|------------|
| **Solo `useState` + `useEffect`** | Refetch manual, sin caché ni deduplicación entre componentes. |
| **Redux Toolkit** | Sobredimensionado para filtros + listas de un módulo. |
| **SWR** | Equivalente a Query; Query ya usado y documentado en `docs/state-management.md`. |
| **Todo en Zustand** | Duplica fuente de verdad; riesgo de desincronización con el servidor. |

## Referencias

- `src/stores/ui-store.ts`, `src/hooks/inventory/`, `src/lib/inventory-api.ts`, `src/lib/query-keys.ts`
- [docs/state-management.md](../state-management.md)
