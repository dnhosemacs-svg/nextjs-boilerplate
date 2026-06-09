# Tarjeta 3.2 — Guión y ensayo (sin grabar)

> **Duración objetivo:** ≤ 5:00  
> **Demo en vivo:** https://nextjs-boilerplate-sigma-eosin-30.vercel.app/  
> **Usuario demo:** WORKER o ADMIN (misma sesión en dos pestañas)

---

## Checklist de la tarjeta

| # | Bloque | Tiempo | Estado ensayo |
|---|--------|--------|---------------|
| 1 | Problema del taller + serverless | 0:00–0:25 | ☐ |
| 2 | Demo inventario en Vercel | 0:25–1:45 | ☐ |
| 3 | Arquitectura (Vercel, Neon, Query; sin Pusher) | 1:45–2:45 | ☐ |
| 4 | Modelo datos + reservas de pedidos (breve) | 2:45–3:30 | ☐ |
| 5 | Reto técnico (tests stock / Decimal / deuda products) | 3:30–4:30 | ☐ |
| 6 | Tests en lib + API; CI en camino | 4:30–5:00 | ☐ |
| — | Ensayo cronometrado ≤ 5 min | — | ☐ |
| — | Diagrama listo (ver `diagrama-arquitectura.md`) | — | ☐ |

---

## Preparación antes del ensayo (5 min)

1. **Pestaña A:** Vercel → login → `/products`
2. **Pestaña B:** misma URL `/products` (misma sesión)
3. **IDE:** `docs/video/diagrama-arquitectura.md` + `src/lib/stock-service.test.ts` + terminal con `npm run test`
4. **Material de referencia:** un tablero o listón con stock visible (p. ej. «Tablero MDF 18mm»)
5. Silenciar notificaciones; micrófono a ~15 cm

---

## Guión completo (qué decir + qué mostrar)

### 0:00–0:25 — Problema del taller + serverless

**Pantalla:** inicio público o dashboard (sin entrar aún al detalle).

**Texto sugerido (~25 s):**

> «TaskFlow Carpintería es un panel interno para un taller de muebles a medida. El problema real no es solo listar materiales: es saber **cuánto hay disponible** cuando varios pedidos compiten por el mismo tablero o herraje.
>
> Lo desplegué en **Vercel** con arquitectura **serverless**: cada petición es una función efímera, sin servidor Node permanente. Eso encaja con un MVP que crece por fases sin montar infraestructura propia.»

**Puntos clave:** taller, stock compartido, Vercel serverless (no Express aparte).

---

### 0:25–1:45 — Demo inventario en Vercel

**Pantalla:** `/products` en Vercel (etiqueta «Materiales»).

| Momento | Acción en pantalla | Qué decir |
|---------|-------------------|-----------|
| 0:25 | Listado con columnas Físico / Reservado / Disponible / Mínimo | «Aquí veo el almacén: no solo el stock físico, sino lo **reservado** por pedidos y lo **disponible** para nuevos trabajos.» |
| 0:40 | Filtro por categoría (p. ej. Tableros) | «Filtro por categoría y búsqueda; los datos vienen de la API con sesión NextAuth.» |
| 0:55 | Editar **Físico** de un material (flechas o teclado) | «Ajusto el stock físico desde la UI; tras un segundo de debounce se registra un movimiento ADJUST en el libro mayor.» |
| 1:10 | Esperar «Guardando…» y valor actualizado | «El cambio persiste en Neon; esta pestaña invalida su caché de TanStack Query.» |
| 1:20 | **Pestaña 2** sin recargar — mismo material, valor viejo | «En la segunda pestaña, **sin F5**, el número no cambia. No es un bug: cada pestaña tiene su propia caché en el cliente.» |
| 1:35 | F5 en pestaña 2 | «Al recargar, vuelve a pedir al servidor y ya coincide. **Nos falta** sincronización en tiempo real — Pusher o WebSockets — para producción con varios operarios.» |

**Nota:** no prometas Pusher como implementado; es **roadmap**.

---

### 1:45–2:45 — Arquitectura (Vercel, Neon, Query; sin Pusher)

**Pantalla:** `docs/video/diagrama-arquitectura.md` (o captura del diagrama).

**Texto sugerido (~60 s):**

> «Tres capas. En el **navegador**, React con **TanStack Query** para datos del servidor y **Zustand** solo para filtros y UI — no duplico la lista en memoria global.
>
> En **Vercel**, Next.js App Router: middleware protege rutas, los Route Handlers en `/api/materials` validan con Zod y hablan con Prisma. NextAuth gestiona la sesión JWT.
>
> En **Neon**, PostgreSQL serverless. Uso **DATABASE_URL** con pooler para runtime en Vercel y **DIRECT_URL** sin pooler para migraciones Prisma — si mezclas las dos, las migraciones fallan o agotas conexiones.
>
> **No hay Pusher hoy.** El flujo es request–response: el cliente pide, el servidor responde, Query cachea. La segunda pestaña no recibe push; por eso la demo de las dos pestañas.»

**Señalar en el diagrama:** Browser → Vercel → Neon; raya punteada «Pusher (futuro)».

---

### 2:45–3:30 — Modelo datos + reservas de pedidos (breve)

**Pantalla:** diagrama ER o `prisma/schema.prisma` (zoom a `Material`, `OrderReservation`).

**Texto sugerido (~45 s):**

> «El modelo es relacional: **Category** uno-a-muchos **Material**. Cada material tiene unidad — metros, m², unidades —, coste y stock con **Decimal** en Postgres, no float, para no perder céntimos ni décimas de tablero.
>
> Los pedidos viven en tablas aparte. Cuando un pedido pasa a aprobado, se crean **reservas** en `order_reservations`: restan del disponible sin consumir el físico hasta producción. Por eso en la tabla veo Físico, Reservado y Disponible por separado.
>
> No entro al flujo completo de pedidos en este vídeo; el inventario es el protagonista, pero las reservas explican la columna Reservado.»

---

### 3:30–4:30 — Reto técnico elegido

**Elegido para el vídeo:** **tests de stock** (mencionar Decimal y deuda products en 1 frase cada uno).

**Pantalla:** `src/lib/stock-service.ts` + `src/lib/stock-service.test.ts`.

**Texto sugerido (~60 s):**

> «El reto que más me importó fue **testear la lógica de stock sin base de datos real**. `getMaterialStock` agrega movimientos IN, OUT y ADJUST y suma reservas activas. Si calculas mal el disponible, el taller aprueba pedidos sin material.
>
> En los tests mockeo Prisma con Vitest: simulo agregados con `Prisma.Decimal` — misma precisión que en producción — y compruebo que físico 8, reservado 2, disponible 6. Eso me obligó a no usar `number` de JavaScript para cantidades.
>
> También hay tests de API en `/api/materials` — auth 401, validación Zod, stock snapshot — unos **53 tests** en verde.
>
> Y documenté una deuda consciente: rutas legacy `/api/products` duplican `/api/materials`; la UI activa ya usa materials, pero no las borré antes del vídeo para no romper Postman. Está en `docs/auditoria/deuda-tecnica.md` como DT-002.»

**Archivos a enseñar si hay tiempo:**

- `stock-service.test.ts` — caso «calcula físico, reservado y disponible»
- `docs/auditoria/deuda-tecnica.md` — entrada DT-002 (solo título, no leer entero)

---

### 4:30–5:00 — Tests en lib + API; CI en camino

**Pantalla:** terminal `npm run test` (salida verde).

**Texto sugerido (~30 s):**

> «Ejecuto `npm run test`: Vitest en `src/lib` — stock, errores Prisma, validadores — y en Route Handlers de materiales y categorías. Cobertura de líneas ~**81%** en el código que cubren los tests; el objetivo del portfolio es superar el 80% y subir ramas.
>
> **CI en camino:** aún no hay workflow de GitHub Actions en el repo; el siguiente paso es un pipeline que ejecute lint, `tsc` y tests en cada push. Hoy la calidad la verifico en local antes de desplegar a Vercel.»

**Cierre (~10 s):**

> «Resumen: inventario real en serverless, stock con reservas y movimientos, tests en la lógica crítica, y tiempo real como mejora pendiente. Repo y docs en GitHub.»

---

## Ensayo cronometrado — cómo hacerlo

1. **Ensayo 1 (sin cámara):** lee en voz alta con cronómetro. Anota desvíos por bloque.
2. **Ensayo 2 (con Loom en borrador):** graba solo para ti; no publiques.
3. **Ajustes típicos si te pasas de 5:00:**
   - Acortar demo: quita filtro por categoría (−15 s)
   - Acortar modelo datos: una frase sobre reservas (−20 s)
   - Deuda products: solo «documentada en DT-002» (−15 s)
4. **Meta por bloque:**

| Bloque | Meta |
|--------|------|
| 1 | 25 s |
| 2 | 80 s |
| 3 | 60 s |
| 4 | 45 s |
| 5 | 60 s |
| 6 | 30 s |
| **Total** | **300 s** |

---

## Frases de respaldo (si te quedas en blanco)

- **Serverless:** «No mantengo un servidor 24/7; Vercel escala por request.»
- **Sin Pusher:** «Los datos están bien guardados; lo que falta es empujar el cambio al resto de clientes.»
- **Decimal:** «0.1 + 0.2 en float no es 0.3; en inventario uso NUMERIC en Postgres.»
- **Deuda products:** «Mismo dato, dos rutas API; consolidaré después del vídeo.»

---

## Relación con tarjeta 3.1

La demo de dos pestañas y el debounce de 1 s en stock físico vienen de la preparación 3.1. Si el deploy falla, vuelve a comprobar login WORKER/ADMIN y seed en Neon antes del ensayo.
