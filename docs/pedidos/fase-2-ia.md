# Fase 2 — IA: BOM desde histórico

> **Fase 2 IA = sugerir BOM desde histórico de pedidos `DELIVERED` cerrados.**

Tarjeta **4.4** (preparación). En v1 el taller usa plantillas manuales ([bom-templates.md](../bom-templates.md)); la IA no está desplegada.

---

## Objetivo

Dado un `furnitureType` y `params` de un pedido nuevo, proponer líneas de material (`materialId`, `plannedQty`) basándose en pedidos **entregados** similares, para que el worker revise y edite antes de aprobar.

---

## Dataset (v1 en PostgreSQL)

Solo pedidos con `status = DELIVERED` y líneas con datos completos.

| Fuente | Campos clave |
|--------|----------------|
| `orders` | `furnitureType`, `parameters`, `laborAmount`, `hasShortages` |
| `order_material_lines` | `materialId`, `plannedQty`, `actualQty`, `unitCostSnapshot` |
| `order_status_events` | `status`, `changedAt` (duración por fase, calidad operativa) |

Detalle de columnas: [datos-ml.md](datos-ml.md).

**Consulta orientativa (SQL):**

```sql
SELECT o.id, o."furnitureType", o.parameters
FROM orders o
WHERE o.status = 'DELIVERED'
ORDER BY o."updatedAt" DESC;
```

---

## Fuera de alcance (v1 actual)

- Modelo entrenado o endpoint de inferencia en producción.
- Sustituir plantillas BOM manuales en la UI.
- Aprendizaje automático en cliente (navegador).

---

## Criterios de éxito (futuro)

1. Entrada: `furnitureType` + `params` (mismo contrato que `POST /api/orders`).
2. Salida: lista sugerida `{ materialId, plannedQty }[]` con nivel de confianza opcional.
3. El worker puede aceptar, ajustar o descartar antes de `APPROVED`.
4. Trazabilidad: marcar si la sugerencia vino de IA vs plantilla manual.

---

## Integración prevista (borrador)

| Capa | Idea |
|------|------|
| Offline / batch | Export periódico de `DELIVERED` → entrenamiento o fine-tuning |
| API | `POST /api/orders/suggest-bom` (rol WORKER/ADMIN) |
| UI | Botón junto a «Cargar plantilla» en planificación de materiales |

---

## Archivos relacionados

| Tema | Archivo |
|------|---------|
| Plantillas manuales v1 | [bom-templates.md](../bom-templates.md) |
| Datos persistidos | [datos-ml.md](datos-ml.md) |
| Flujo de estados | [flujo-estados.md](flujo-estados.md) |
| Registro de estados | `src/lib/order-status-events.ts` |
