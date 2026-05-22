"use client";

import { Card, CardContent } from "@/components/ui/card";
import { InventoryModule } from "./inventory-module";
import { InventoryPageHeader } from "./inventory-page-header";
import { SearchBar } from "./search-bar";
import { CategoryFilter } from "./category-filter";
import { ProductList } from "./product-list";
import { ProductForm } from "./product-form";

export function ProductsView() {
  return (
    <InventoryModule>
      <Card>
        <InventoryPageHeader
          title="Productos"
          description="Listado, filtros, alta, edición y eliminación."
        />
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar />
            <CategoryFilter />
          </div>
          <ProductList />
          <div className="border-t pt-6">
            <h2 className="mb-4 text-sm font-medium">Nuevo producto</h2>
            <ProductForm />
          </div>
        </CardContent>
      </Card>
    </InventoryModule>
  );
}
