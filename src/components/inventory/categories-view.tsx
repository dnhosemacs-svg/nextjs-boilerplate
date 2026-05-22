"use client";

import { Card, CardContent } from "@/components/ui/card";
import { InventoryModule } from "./inventory-module";
import { InventoryPageHeader } from "./inventory-page-header";
import { CategoryForm } from "./category-form";
import { CategoryList } from "./category-list";

export function CategoriesView() {
  return (
    <InventoryModule>
      <Card>
        <InventoryPageHeader
          title="Categorías"
          description="Crear, editar y eliminar categorías del inventario."
        />
        <CardContent className="space-y-6">
          <CategoryForm mode="create" />
          <CategoryList />
        </CardContent>
      </Card>
    </InventoryModule>
  );
}
