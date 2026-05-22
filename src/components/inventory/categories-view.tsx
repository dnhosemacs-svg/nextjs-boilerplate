"use client";

import { InventoryModule } from "./inventory-module";
import { InventoryPageHeader } from "./inventory-page-header";
import { CategoryForm } from "./category-form";
import { CategoryList } from "./category-list";

export function CategoriesView() {
  return (
    <InventoryModule variant="warm">
      <div className="inventory-warm-layout">
        <InventoryPageHeader
          variant="warm"
          title="Categorías"
          description="Crear, editar y eliminar categorías del inventario."
        />

        <section className="surface-card inventory-warm-panel">
          <div className="inventory-warm-form-row">
            <CategoryForm mode="create" />
          </div>
          <CategoryList />
        </section>
      </div>
    </InventoryModule>
  );
}
