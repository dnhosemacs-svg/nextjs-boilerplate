import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import {
  getMaterialStock,
  StockServiceError,
} from "@/lib/stock-service";

const { findUnique, aggregate } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  aggregate: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    material: { findUnique },
    stockMovement: { aggregate },
    orderReservation: { aggregate },
    $transaction: vi.fn(),
  },
}));

describe("getMaterialStock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lanza MATERIAL_NOT_FOUND si el material no existe", async () => {
    findUnique.mockResolvedValue(null);

    await expect(getMaterialStock("id-inexistente")).rejects.toMatchObject({
      code: "MATERIAL_NOT_FOUND",
      name: "StockServiceError",
    });

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: "id-inexistente" },
      select: { id: true },
    });
  });

  it("calcula físico, reservado y disponible desde agregados", async () => {
    findUnique.mockResolvedValue({ id: "mat-1" });

    aggregate.mockImplementation(async (args: { where?: { type?: string } }) => {
      const type = args.where?.type;
      if (type === "IN") return { _sum: { quantity: new Prisma.Decimal(10) } };
      if (type === "OUT") return { _sum: { quantity: new Prisma.Decimal(3) } };
      if (type === "ADJUST") return { _sum: { quantity: new Prisma.Decimal(1) } };
      return { _sum: { quantity: new Prisma.Decimal(2) } };
    });

    const stock = await getMaterialStock("mat-1");

    expect(stock).toEqual({
      physical: "8.000",
      reserved: "2.000",
      available: "6.000",
    });
  });
});
