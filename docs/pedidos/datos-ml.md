# Datos para ML / IA (preparación v1)

Tarjeta **4.4**: qué se persiste hoy en PostgreSQL para entrenar o analizar pedidos cerrados en una **fase 2** (sugerencia de BOM desde histórico).

Roadmap IA: [fase-2-ia.md](fase-2-ia.md) — *Fase 2 IA = sugerir BOM desde histórico de pedidos `DELIVERED` cerrados.*

---

## Pedido (`orders`)

| Campo | Tipo | Uso ML |
|-------|------|--------|
| `furnitureType` | string (enum app) | Clasificación del tipo de mueble |
| `parameters` | JSON | Dimensiones y atributos libres (`params` en API) |
| `status` | `OrderStatus` | Estado actual (filtro: solo `DELIVERED` para entrenamiento) |
| `hasShortages` / `shortages` | bool + JSON | Señal de faltantes al aprobar |
| `laborAmount` | decimal | Coste mano de obra al cierre |
| `createdAt` / `updatedAt` | datetime | Creación y última modificación |

---

## Líneas de material (`order_material_lines`)

| Campo | Uso ML |
|-------|--------|
| `plannedQty` | Cantidad planificada (BOM aprobado) |
| `actualQty` | Consumo real en taller (tras `IN_PRODUCTION`) |
| `unitCostSnapshot` | Coste unitario en el momento del plan |
| `materialId` | Enlace al catálogo de materiales |

Comparar **planificado vs real** por material y por pedido entregado.

---

## Historial de estados (`order_status_events`)

Cada cambio de estado registrado al:

- crear pedido (`DRAFT`),
- `PATCH /api/orders/:id/status` (transiciones válidas).

| Campo | Uso ML |
|-------|--------|
| `status` | Estado alcanzado |
| `changedAt` | Timestamp del cambio (duración por fase) |
| `userId` | Quién ejecutó la transición (opcional) |

Implementación: `src/lib/order-status-events.ts` → `recordOrderStatusEvent`.

**Consulta ejemplo (pedidos entregados con líneas):**

```sql
SELECT o.id, o."furnitureType", o.parameters, o."laborAmount"
FROM orders o
WHERE o.status = 'DELIVERED';
```

En Prisma Studio: tabla `order_status_events` ordenada por `changedAt` para un `orderId` del flujo feliz (checklist 4.4 §3).

---

## Qué no se exporta aún en API

El `GET /api/orders/:id` para **CLIENT** oculta líneas y faltantes (`serializeOrder` con `audience: "client"`). Para ML usar **BD** o ampliar API interna en fase 2.

---

## Archivos relacionados

| Pieza | Archivo |
|-------|---------|
| Modelos | `prisma/schema.prisma` |
| Registro eventos | `src/lib/order-status-events.ts` |
| API estado | `src/app/api/orders/[id]/status/route.ts` |
| Alta pedido | `src/app/api/orders/route.ts` |
| Tipos DTO | `src/types/order.ts` |
