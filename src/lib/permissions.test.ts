import { describe, it, expect } from "vitest";
import {
  canAccessInventory,
  canWriteStock,
  canRecordStockAdjust,
} from "@/lib/permissions";
import { UserRole } from "@/types/user-role";

describe("acceso a inventario", () => {
  it("ADMIN y WORKER pueden acceder al inventario", () => {
    expect(canAccessInventory(UserRole.ADMIN)).toBe(true);
    expect(canAccessInventory(UserRole.WORKER)).toBe(true);
  });

  it("CLIENT no puede acceder al inventario", () => {
    expect(canAccessInventory(UserRole.CLIENT)).toBe(false);
  });
});

describe("escritura de stock", () => {
  it("ADMIN y WORKER pueden escribir movimientos", () => {
    expect(canWriteStock(UserRole.ADMIN)).toBe(true);
    expect(canWriteStock(UserRole.WORKER)).toBe(true);
    expect(canWriteStock(UserRole.CLIENT)).toBe(false);
  });

  it("solo ADMIN puede registrar ajustes", () => {
    expect(canRecordStockAdjust(UserRole.ADMIN)).toBe(true);
    expect(canRecordStockAdjust(UserRole.WORKER)).toBe(false);
    expect(canRecordStockAdjust(UserRole.CLIENT)).toBe(false);
  });
});
