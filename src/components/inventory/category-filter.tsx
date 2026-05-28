"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoriesQuery } from "@/hooks/inventory";
import { useUiStore } from "@/stores/ui-store";

const ALL = "__all__";

export function CategoryFilter() {
  const categoryId = useUiStore((s) => s.productFilters.categoryId);
  const setProductFilters = useUiStore((s) => s.setProductFilters);
  const { data: categories = [], isLoading } = useCategoriesQuery();

  return (
    <Select
      value={categoryId ?? ALL}
      onValueChange={(value) =>
        setProductFilters({
          categoryId: value && value !== ALL ? value : undefined,
        })
      }
      disabled={isLoading}
    >
      <SelectTrigger className="w-full min-w-[12rem]">
        <SelectValue placeholder="Todas las categorías" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>Todas las categorías</SelectItem>
        {categories.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
