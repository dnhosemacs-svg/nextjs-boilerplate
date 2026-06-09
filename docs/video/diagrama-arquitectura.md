# Diagrama de arquitectura — demo vídeo 3.2

> **Uso:** compartir pantalla en el bloque 1:45–2:45 del guión.  
> Puedes exportar este Mermaid a PNG desde [mermaid.live](https://mermaid.live) o redibujarlo en Excalidraw.

---

## Vista para el vídeo (Mermaid)

```mermaid
flowchart TB
  subgraph Browser["Navegador (React)"]
    UI["/products — Materiales"]
    ZS["Zustand<br/>filtros · búsqueda"]
    TQ["TanStack Query<br/>caché · mutaciones"]
    UI --> ZS
    UI --> TQ
  end

  subgraph Vercel["Vercel — Next.js serverless"]
    MW["middleware.ts<br/>sesión · roles"]
    API["Route Handlers<br/>/api/materials · /api/categories"]
    AUTH["NextAuth + Firebase"]
    PRISMA["Prisma Client<br/>src/lib/db.ts"]
    MW --> API
    API --> AUTH
    API --> PRISMA
  end

  subgraph Neon["Neon — PostgreSQL"]
    DB[("categories · materials<br/>stock_movements<br/>orders · order_reservations")]
  end

  subgraph Futuro["Fase posterior (no implementado)"]
    PUSHER["Pusher / WebSockets<br/>push stock-updated"]
  end

  TQ -->|"fetch + cookie sesión"| MW
  PRISMA -->|"DATABASE_URL pooled"| DB
  API -.->|"emitir evento (futuro)"| PUSHER
  PUSHER -.->|"invalidar caché (futuro)"| TQ

  style Futuro fill:#f9f9f9,stroke:#999,stroke-dasharray: 5 5
  style PUSHER fill:#fff3cd,stroke:#856404
```

---

## Flujo de lectura de materiales (secuencia)

```mermaid
sequenceDiagram
  participant U as Usuario
  participant Q as TanStack Query
  participant N as Next.js API
  participant P as Prisma
  participant DB as Neon

  U->>Q: Abre /products
  Q->>N: GET /api/materials
  N->>N: requireApiSession()
  N->>P: material.findMany()
  P->>DB: SQL
  DB-->>P: filas
  P-->>N: Material[]
  N-->>Q: JSON
  Q-->>U: Tabla renderizada

  Note over U,DB: Segunda pestaña: misma secuencia solo tras F5<br/>o staleTime expirado — sin push
```

---

## Modelo datos (inventario + reservas)

```mermaid
erDiagram
  Category ||--o{ Material : tiene
  Material ||--o{ StockMovement : registra
  Material ||--o{ OrderReservation : reserva
  Order ||--o{ OrderReservation : genera
  Order ||--o{ OrderMaterialLine : incluye
  Material ||--o{ OrderMaterialLine : usa

  Category {
    string id PK
    string name UK
  }

  Material {
    string id PK
    string name
    enum unit
    decimal unitCost
    decimal stock
    decimal minStock
    string categoryId FK
  }

  OrderReservation {
    string id PK
    string orderId FK
    string materialId FK
    decimal quantity
    boolean active
  }
```

**Fórmula en voz alta:** disponible = físico − reservado activo.

---

## ASCII rápido (si no cargas Mermaid)

```
┌──────────────┐     HTTPS      ┌─────────────────────────┐
│  Navegador   │ ─────────────► │  Vercel / Next.js       │
│  Query+Zustand│ ◄──────────── │  /api/materials + Auth  │
└──────────────┘                └───────────┬─────────────┘
                                            │ Prisma (pool)
                                            ▼
                                ┌─────────────────────────┐
                                │  Neon PostgreSQL        │
                                │  materials, movements,  │
                                │  order_reservations     │
                                └─────────────────────────┘

        - - - - Pusher (futuro) - - - -► invalidar Query
```

---

## Exportar PNG borrador

1. Copia el primer bloque Mermaid a https://mermaid.live
2. **Actions → PNG** → guardar como `docs/video/diagrama-arquitectura.png`
3. En el ensayo, alterna entre PNG y demo en Vercel
