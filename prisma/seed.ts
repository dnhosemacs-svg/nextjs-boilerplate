import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString =
  process.env.DIRECT_URL?.trim() ?? process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error(
    "[seed] Falta DIRECT_URL o DATABASE_URL en el entorno (.env en la raíz).",
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const muebles = await prisma.category.create({
    data: { name: "Muebles a medida" },
  });
  const puertas = await prisma.category.create({
    data: { name: "Puertas y ventanas" },
  });
  const reparaciones = await prisma.category.create({
    data: { name: "Reparaciones y acabados" },
  });

  await prisma.product.createMany({
    data: [
      {
        name: "Armario empotrado roble",
        description: "Interior configururable, frente macizo.",
        sku: "MUE-ARM-001",
        price: 2400,
        stock: 1,
        categoryId: muebles.id,
      },
      {
        name: "Estantería modular salón",
        description: "Módulos combinable en roble barnizado.",
        sku: "MUE-EST-002",
        price: 890,
        stock: 3,
        categoryId: muebles.id,
      },
      {
        name: "Mesa comedor maciza",
        description: "Tablero 180×90, patas torneadas.",
        sku: "MUE-MES-003",
        price: 1150,
        stock: 2,
        categoryId: muebles.id,
      },
      {
        name: "Puerta interior lacada blanco",
        description: "Hoja 72/82, marco incluido.",
        sku: "PUE-PIN-004",
        price: 265,
        stock: 8,
        categoryId: puertas.id,
      },
      {
        name: "Puerta exterior ignífuga",
        description: "Certificación y herrajes inox.",
        sku: "PUE-EXT-005",
        price: 620,
        stock: 4,
        categoryId: puertas.id,
      },
      {
        name: "Ventana PVC 2 hojas",
        description: "Doble acristalamiento bajo emisivo.",
        sku: "PUE-VEN-006",
        price: 480,
        stock: 6,
        categoryId: puertas.id,
      },
      {
        name: "Persiana enrollable madera",
        description: "Lama 50 mm, motor opcional.",
        sku: "PUE-PER-007",
        price: 320,
        stock: 5,
        categoryId: puertas.id,
      },
      {
        name: "Reparación bisagras y cuadros",
        description: "Ajuste y sustitución de herrajes.",
        sku: "REP-BIS-008",
        price: 85,
        stock: 0,
        categoryId: reparaciones.id,
      },
      {
        name: "Restauración parquet localizado",
        description: "Lijado parcial y barniz al agua.",
        sku: "REP-PAR-009",
        price: 160,
        stock: 0,
        categoryId: reparaciones.id,
      },
      {
        name: "Encimera cocina postformada",
        description: "Corte y canteado a medida.",
        sku: "REP-ENC-010",
        price: 210,
        stock: 2,
        categoryId: reparaciones.id,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
