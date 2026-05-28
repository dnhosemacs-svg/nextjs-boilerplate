# Plantillas BOM v1 manual

Tarjeta 3.3: plantillas manuales sin IA para precargar lineas sugeridas de materiales.

## Objetivo

Permitir que el pedido cargue una propuesta inicial de lineas de material segun:

- `furnitureType`
- `params`

Estas lineas son un borrador editable antes de guardar y antes de aprobar el pedido.

## Tipos soportados (8)

- `MESA`
- `ARMARIO`
- `ESTANTERIA`
- `CAJONERA`
- `MESITA`
- `PUERTA`
- `ENCIMERA`
- `ZAPATERO`

## Magnitudes de salida

Cada plantilla calcula estas 3 magnitudes:

- `tableroM2`
- `listonM`
- `herrajesUd`

En la carga de borrador se mapean a materiales por unidad:

- `tableroM2` -> material con unidad `M2`
- `listonM` -> material con unidad `M`
- `herrajesUd` -> material con unidad `UD`

## Merma de tableros

Se aplica merma fija del 10%:

- `BOARD_WASTE_FACTOR = 0.1`

Implementado en `src/lib/bom-templates/index.ts`.

## Parametros esperados por tipo

### MESA

- requeridos: `ancho`, `fondo`
- opcionales: `alto`

### ARMARIO

- requeridos: `ancho`, `fondo`
- opcionales: `alto`, `puertas`

### ESTANTERIA

- requeridos: `ancho`, `fondo`
- opcionales: `alto`, `baldas`

### CAJONERA

- requeridos: `ancho`, `fondo`
- opcionales: `alto`, `cajones`

### MESITA

- requeridos: `ancho`, `fondo`
- opcionales: `alto`

### PUERTA

- requeridos: `ancho`, `alto`
- opcionales: `fondo`

### ENCIMERA

- requeridos: `ancho`, `fondo`
- opcionales: `alto`

### ZAPATERO

- requeridos: `ancho`, `fondo`
- opcionales: `alto`, `baldas`

## Reglas v1

- Si faltan parametros u ocurren valores no numericos, se sanean a `0`.
- La plantilla devuelve solo cantidades positivas.
- Las lineas cargadas siguen siendo editables en UI.
- El guardado usa el flujo normal de lineas de pedido.

## Flujo de uso

1. Crear/editar pedido.
2. Definir `furnitureType` y `params`.
3. En planificacion de materiales, pulsar `Cargar plantilla`.
4. Revisar y editar lineas sugeridas.
5. Guardar lineas.
6. El worker revisa antes de aprobar el pedido.

