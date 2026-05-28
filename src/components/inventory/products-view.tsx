"use client";

import { InventoryModule } from "./inventory-module";
import { InventoryPageHeader } from "./inventory-page-header";
import { SearchBar } from "./search-bar";
import { CategoryFilter } from "./category-filter";
import { MaterialList } from "./material-list";
import { MaterialForm } from "./material-form";

export function ProductsView() {
  return (
    <InventoryModule variant="warm">
      <div className="inventory-warm-layout inventory-products-layout">
        <InventoryPageHeader
          variant="warm"
          title="Materiales"
          description="Listado, filtros, alta, edición y eliminación de materiales."
        />

        <section className="inventory-products-list-panel">
          <div className="inventory-warm-toolbar">
            <SearchBar />
            <CategoryFilter />
          </div>

          <div className="inventory-warm-body">
            <MaterialList />
          </div>
        </section>

        <section className="inventory-products-form-panel">
          <h2 className="inventory-warm-subtitle">Nuevo material</h2>
          <MaterialForm />
        </section>
      </div>
    </InventoryModule>
  );
}
