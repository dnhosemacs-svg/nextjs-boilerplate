import { z } from "zod";

export function nonEmptyUpdateSchema<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape).refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  });
}
