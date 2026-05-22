"use client";

import { MinusIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
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
  onEdit?: () => void;
  onDelete?: () => void;
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

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const stockMutation = useUpdateStockMutation();
  const pending = stockMutation.isPending;

  function changeStock(delta: number) {
    const next = Math.max(0, product.stock + delta);
    if (next === product.stock) return;
    stockMutation.mutate({ id: product.id, input: { stock: next } });
  }

  return (
    <Card size="sm" className="inventory-product-card !gap-4 !py-5">
      <CardHeader className="!pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="min-w-0 flex-1">{product.name}</CardTitle>
          <div className="flex shrink-0 items-center gap-1">
            <Badge variant="secondary">{product.category.name}</Badge>
            {onEdit ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onEdit}
                aria-label={`Editar ${product.name}`}
              >
                <PencilIcon />
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onDelete}
                aria-label={`Eliminar ${product.name}`}
              >
                <Trash2Icon />
              </Button>
            ) : null}
          </div>
        </div>
        {product.sku ? (
          <CardDescription>SKU: {product.sku}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-3 !pt-2 !pb-3">
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
