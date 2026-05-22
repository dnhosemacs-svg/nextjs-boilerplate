import { QueryClient } from "@tanstack/react-query";

/** Por defecto para todas las queries del inventario (salvo overrides en hooks). */
export const DEFAULT_STALE_TIME_MS = 2 * 60 * 1000;
export const DEFAULT_GC_TIME_MS = 10 * 60 * 1000;

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // fresh: durante este tiempo no refetch automático al remontar o refocus
        staleTime: DEFAULT_STALE_TIME_MS,
        // tras desmontar el último observer, la caché se elimina pasado este tiempo
        gcTime: DEFAULT_GC_TIME_MS,
      },
    },
  });
}
