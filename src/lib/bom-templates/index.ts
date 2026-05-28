import type { FurnitureType } from "@/lib/validators/order";
import type { Material } from "@/types/inventory";
import type { UpsertOrderMaterialLinePayload } from "@/types/order";

export const BOARD_WASTE_FACTOR = 0.1;

export type BomTemplateParams = {
  ancho: number; // cm
  alto: number; // cm
  fondo: number; // cm
  puertas?: number; // ud
  cajones?: number; // ud
  baldas?: number; // ud
};

export type BomTemplateQuantities = {
  tableroM2: number;
  listonM: number;
  herrajesUd: number;
};

export type BomTemplateDefinition = {
  furnitureType: FurnitureType;
  compute: (params: BomTemplateParams) => BomTemplateQuantities;
};

function safeNumber(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
}

function toMeters(valueCm: number): number {
  return valueCm / 100;
}

function baseBoardM2(params: BomTemplateParams): number {
  const anchoM = toMeters(safeNumber(params.ancho));
  const fondoM = toMeters(safeNumber(params.fondo));
  return anchoM * fondoM;
}

function withBoardWaste(boardM2: number): number {
  return boardM2 * (1 + BOARD_WASTE_FACTOR);
}

function basePerimeterM(params: BomTemplateParams): number {
  const anchoM = toMeters(safeNumber(params.ancho));
  const fondoM = toMeters(safeNumber(params.fondo));
  return 2 * (anchoM + fondoM);
}

function computeMesa(params: BomTemplateParams): BomTemplateQuantities {
  return {
    tableroM2: withBoardWaste(baseBoardM2(params)),
    listonM: basePerimeterM(params) * 1.2,
    herrajesUd: 24,
  };
}

function computeArmario(params: BomTemplateParams): BomTemplateQuantities {
  const puertas = Math.max(1, safeNumber(params.puertas));
  return {
    tableroM2: withBoardWaste(baseBoardM2(params) * 2.5),
    listonM: basePerimeterM(params) * 1.6,
    herrajesUd: puertas * 4 + 12,
  };
}

function computeEstanteria(params: BomTemplateParams): BomTemplateQuantities {
  const baldas = Math.max(1, safeNumber(params.baldas));
  return {
    tableroM2: withBoardWaste(baseBoardM2(params) * (1.3 + baldas * 0.15)),
    listonM: basePerimeterM(params) * 1.1,
    herrajesUd: baldas * 4 + 8,
  };
}

function computeCajonera(params: BomTemplateParams): BomTemplateQuantities {
  const cajones = Math.max(1, safeNumber(params.cajones));
  return {
    tableroM2: withBoardWaste(baseBoardM2(params) * (1.4 + cajones * 0.2)),
    listonM: basePerimeterM(params) * 1.3,
    herrajesUd: cajones * 6 + 12,
  };
}

function computeMesita(params: BomTemplateParams): BomTemplateQuantities {
  return {
    tableroM2: withBoardWaste(baseBoardM2(params) * 1.2),
    listonM: basePerimeterM(params) * 1.1,
    herrajesUd: 16,
  };
}

function computePuerta(params: BomTemplateParams): BomTemplateQuantities {
  const anchoM = toMeters(safeNumber(params.ancho));
  const altoM = toMeters(safeNumber(params.alto));
  const area = anchoM * altoM;
  return {
    tableroM2: withBoardWaste(area),
    listonM: 2 * (anchoM + altoM),
    herrajesUd: 6,
  };
}

function computeEncimera(params: BomTemplateParams): BomTemplateQuantities {
  return {
    tableroM2: withBoardWaste(baseBoardM2(params) * 1.05),
    listonM: basePerimeterM(params),
    herrajesUd: 10,
  };
}

function computeZapatero(params: BomTemplateParams): BomTemplateQuantities {
  const baldas = Math.max(1, safeNumber(params.baldas));
  return {
    tableroM2: withBoardWaste(baseBoardM2(params) * (1.2 + baldas * 0.12)),
    listonM: basePerimeterM(params) * 1.1,
    herrajesUd: baldas * 3 + 10,
  };
}

export const BOM_TEMPLATES: Record<FurnitureType, BomTemplateDefinition> = {
  MESA: { furnitureType: "MESA", compute: computeMesa },
  ARMARIO: { furnitureType: "ARMARIO", compute: computeArmario },
  ESTANTERIA: { furnitureType: "ESTANTERIA", compute: computeEstanteria },
  CAJONERA: { furnitureType: "CAJONERA", compute: computeCajonera },
  MESITA: { furnitureType: "MESITA", compute: computeMesita },
  PUERTA: { furnitureType: "PUERTA", compute: computePuerta },
  ENCIMERA: { furnitureType: "ENCIMERA", compute: computeEncimera },
  ZAPATERO: { furnitureType: "ZAPATERO", compute: computeZapatero },
};

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function materialByUnit(materials: Material[], unit: Material["unit"]): Material | null {
  const ordered = [...materials].sort((a, b) => a.name.localeCompare(b.name));
  return ordered.find((material) => material.unit === unit) ?? null;
}

function toTemplateParams(params: Record<string, unknown>): BomTemplateParams {
  return {
    ancho: safeNumber(params.ancho),
    alto: safeNumber(params.alto),
    fondo: safeNumber(params.fondo),
    puertas: safeNumber(params.puertas),
    cajones: safeNumber(params.cajones),
    baldas: safeNumber(params.baldas),
  };
}

export function buildTemplateDraftLines(input: {
  furnitureType: FurnitureType;
  params: Record<string, unknown>;
  materials: Material[];
}): UpsertOrderMaterialLinePayload[] {
  const template = BOM_TEMPLATES[input.furnitureType];
  const amounts = template.compute(toTemplateParams(input.params));
  const board = materialByUnit(input.materials, "M2");
  const slat = materialByUnit(input.materials, "M");
  const fittings = materialByUnit(input.materials, "UD");

  const lines: UpsertOrderMaterialLinePayload[] = [];
  if (board && amounts.tableroM2 > 0) {
    lines.push({ materialId: board.id, plannedQty: round3(amounts.tableroM2) });
  }
  if (slat && amounts.listonM > 0) {
    lines.push({ materialId: slat.id, plannedQty: round3(amounts.listonM) });
  }
  if (fittings && amounts.herrajesUd > 0) {
    lines.push({ materialId: fittings.id, plannedQty: round3(amounts.herrajesUd) });
  }
  return lines;
}

