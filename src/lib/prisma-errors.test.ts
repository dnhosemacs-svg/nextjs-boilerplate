import { describe, it, expect } from "vitest";

import { Prisma } from "@/generated/prisma/client";
import { handlePrismaWriteError } from "@/lib/prisma-errors";

describe("handlePrismaWriteError", () => {
  it("devuelve 409 para violación unique (P2002)", async () => {
    const error = new Prisma.PrismaClientKnownRequestError("Unique", {
      code: "P2002",
      clientVersion: "test",
    });

    const res = handlePrismaWriteError(error, {
      unique: "Duplicado",
    });

    expect(res?.status).toBe(409);
    expect(await res?.json()).toEqual({ error: "Duplicado" });
  });

  it("devuelve 400 para violación foreign key (P2003)", async () => {
    const error = new Prisma.PrismaClientKnownRequestError("FK", {
      code: "P2003",
      clientVersion: "test",
    });

    const res = handlePrismaWriteError(error, {
      foreignKey: "Referencia inválida",
    });

    expect(res?.status).toBe(400);
    expect(await res?.json()).toEqual({ error: "Referencia inválida" });
  });

  it("devuelve null para errores no Prisma", () => {
    expect(handlePrismaWriteError(new Error("otro"), {})).toBeNull();
  });
});
