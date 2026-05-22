"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUpdateStockMutation } from "@/hooks/inventory";
import type { Product } from "@/types/inventory";

type ProductCardProps = {
  product: Product;
};

function formatPrice(price: string) {
  const n = Number(price);
  return Number.isFinite(n)
    ? new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
      }).format(n)
    : price;
}

export function ProductCard({ product }: ProductCardProps) {
  const stockMutation = useUpdateStockMutation();
  const pending = stockMutation.isPending;

  function changeStock(delta: number) {
    const next = Math.max(0, product.stock + delta);
    if (next === product.stock) return;
    stockMutation.mutate({ id: product.id, input: { stock: next } });
  }

  return (
    <Card size="sm">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{product.name}</CardTitle>
          <Badge variant="secondary">{product.category.name}</Badge>
        </div>
        {product.sku ? (
          <CardDescription>SKU: {product.sku}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="font-medium">{formatPrice(product.price)}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Stock</span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={pending || product.stock <= 0}
              onClick={() => changeStock(-1)}
              aria-label="Reducir stock"
            >
              <MinusIcon />
            </Button>
            <span className="min-w-8 text-center font-medium tabular-nums">
              {product.stock}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={pending}
              onClick={() => changeStock(1)}
              aria-label="Aumentar stock"
            >
              <PlusIcon />
            </Button>
          </div>
        </div>
        {stockMutation.isError ? (
          <p className="text-sm text-destructive">{stockMutation.error.message}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
