import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductListQuery } from "@/lib/validators/product";

const defaultProductFilters: ProductListQuery = {
  search: undefined,
  categoryId: undefined,
  sortBy: "name",
  sortOrder: "asc",
};

type UiState = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  productFilters: ProductListQuery;
  setProductFilters: (patch: Partial<ProductListQuery>) => void;
  resetProductFilters: () => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      productFilters: defaultProductFilters,
      setProductFilters: (patch) =>
        set((state) => ({
          productFilters: { ...state.productFilters, ...patch },
        })),
      resetProductFilters: () => set({ productFilters: defaultProductFilters }),
    }),
    {
      name: "carpinteria-ui",
      partialize: (state) => ({ sidebarOpen: state.sidebarOpen }),
    },
  ),
);
