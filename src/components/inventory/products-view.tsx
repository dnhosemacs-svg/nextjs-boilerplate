"use client";

import { InventoryModule } from "./inventory-module";
import { InventoryPageHeader } from "./inventory-page-header";
import { SearchBar } from "./search-bar";
import { CategoryFilter } from "./category-filter";
import { ProductList } from "./product-list";
import { ProductForm } from "./product-form";

export function ProductsView() {
  return (
    <InventoryModule variant="warm">
      <div className="inventory-warm-layout inventory-products-layout">
        <InventoryPageHeader
          variant="warm"
          title="Productos"
          description="Listado, filtros, alta, edición y eliminación."
        />

        <section className="inventory-products-list-panel">
          <div className="inventory-warm-toolbar">
            <SearchBar />
            <CategoryFilter />
          </div>

          <div className="inventory-warm-body">
            <ProductList />
          </div>
        </section>

        <section className="inventory-products-form-panel">
          <h2 className="inventory-warm-subtitle">Nuevo producto</h2>
          <ProductForm />
        </section>
      </div>
    </InventoryModule>
  );
}
