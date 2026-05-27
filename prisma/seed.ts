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
  await prisma.stockMovement.deleteMany();
  await prisma.orderReservation.deleteMany();
  await prisma.orderMaterialLine.deleteMany();
  await prisma.order.deleteMany();
  await prisma.material.deleteMany();
  await prisma.category.deleteMany();

  const tableros = await prisma.category.create({ data: { name: "Tableros" } });
  const listones = await prisma.category.create({ data: { name: "Listones" } });
  const herrajes = await prisma.category.create({ data: { name: "Herrajes" } });
  const barnices = await prisma.category.create({ data: { name: "Barnices" } });
  const tornilleria = await prisma.category.create({
    data: { name: "Tornillería" },
  });

  await prisma.material.createMany({
    data: [
      {
        name: "Tablero contrachapado abedul 18mm (1220×2440)",
        sku: "TAB-CON-18-1220x2440",
        unit: "UD",
        unitCost: 58.9,
        stock: 12,
        minStock: 4,
        location: "Estantería A1",
        categoryId: tableros.id,
      },
      {
        name: "MDF 19mm (1220×2440)",
        sku: "TAB-MDF-19-1220x2440",
        unit: "UD",
        unitCost: 34.5,
        stock: 18,
        minStock: 6,
        location: "Estantería A2",
        categoryId: tableros.id,
      },
      {
        name: "Melamina blanca 16mm (1220×2440)",
        sku: "TAB-MEL-BLA-16-1220x2440",
        unit: "UD",
        unitCost: 26.8,
        stock: 20,
        minStock: 8,
        location: "Estantería A3",
        categoryId: tableros.id,
      },
      {
        name: "Tablero OSB 3 15mm (1250×2500)",
        sku: "TAB-OSB3-15-1250x2500",
        unit: "UD",
        unitCost: 19.9,
        stock: 10,
        minStock: 4,
        location: "Estantería A4",
        categoryId: tableros.id,
      },
      {
        name: "Listón pino cepillado 30×40",
        sku: "LIS-PIN-30x40",
        unit: "M",
        unitCost: 1.25,
        stock: 180,
        minStock: 60,
        location: "Rack L1",
        categoryId: listones.id,
      },
      {
        name: "Listón haya 20×20",
        sku: "LIS-HAY-20x20",
        unit: "M",
        unitCost: 2.1,
        stock: 120,
        minStock: 40,
        location: "Rack L2",
        categoryId: listones.id,
      },
      {
        name: "Canto PVC blanco 22mm",
        sku: "LIS-CAN-PVC-BLA-22",
        unit: "M",
        unitCost: 0.18,
        stock: 600,
        minStock: 200,
        location: "Cajón C1",
        categoryId: listones.id,
      },
      {
        name: "Bisagra cazoleta 35mm soft-close",
        sku: "HER-BIS-35-SC",
        unit: "UD",
        unitCost: 1.35,
        stock: 250,
        minStock: 80,
        location: "Cajón H1",
        categoryId: herrajes.id,
      },
      {
        name: "Guía cajón telescópica 500mm (par)",
        sku: "HER-GUIA-500-PAR",
        unit: "UD",
        unitCost: 6.8,
        stock: 60,
        minStock: 20,
        location: "Cajón H2",
        categoryId: herrajes.id,
      },
      {
        name: "Tirador inox 160mm",
        sku: "HER-TIR-INOX-160",
        unit: "UD",
        unitCost: 2.4,
        stock: 110,
        minStock: 40,
        location: "Cajón H3",
        categoryId: herrajes.id,
      },
      {
        name: "Cola blanca D3",
        sku: "BAR-COL-D3",
        unit: "L",
        unitCost: 6.9,
        stock: 18,
        minStock: 6,
        location: "Armario Q1",
        categoryId: barnices.id,
      },
      {
        name: "Barniz al agua satinado",
        sku: "BAR-AGUA-SAT",
        unit: "L",
        unitCost: 12.5,
        stock: 25,
        minStock: 8,
        location: "Armario Q2",
        categoryId: barnices.id,
      },
      {
        name: "Aceite de teka",
        sku: "BAR-ACE-TEKA",
        unit: "L",
        unitCost: 9.8,
        stock: 10,
        minStock: 4,
        location: "Armario Q2",
        categoryId: barnices.id,
      },
      {
        name: "Tornillo madera 4×40 (caja 200)",
        sku: "TOR-MAD-4x40-200",
        unit: "UD",
        unitCost: 6.2,
        stock: 45,
        minStock: 15,
        location: "Cajón T1",
        categoryId: tornilleria.id,
      },
      {
        name: "Tornillo madera 5×60 (caja 100)",
        sku: "TOR-MAD-5x60-100",
        unit: "UD",
        unitCost: 5.9,
        stock: 30,
        minStock: 10,
        location: "Cajón T1",
        categoryId: tornilleria.id,
      },
      {
        name: "Taco nylon 8mm (caja 100)",
        sku: "TOR-TAC-8-100",
        unit: "UD",
        unitCost: 4.1,
        stock: 35,
        minStock: 12,
        location: "Cajón T2",
        categoryId: tornilleria.id,
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
