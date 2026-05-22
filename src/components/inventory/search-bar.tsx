"use client";

import { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useUiStore } from "@/stores/ui-store";

export function SearchBar() {
  const search = useUiStore((s) => s.productFilters.search ?? "");
  const setProductFilters = useUiStore((s) => s.setProductFilters);
  const [local, setLocal] = useState(search);
  const debounced = useDebouncedValue(local, 300);

  useEffect(() => {
    setProductFilters({
      search: debounced.trim() || undefined,
    });
  }, [debounced, setProductFilters]);

  return (
    <div className="relative w-full max-w-md">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-8"
        placeholder="Buscar por nombre o SKU…"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        aria-label="Buscar productos"
      />
    </div>
  );
}
