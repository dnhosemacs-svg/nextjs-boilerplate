import { Badge } from "@/components/ui/badge";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type InventoryPageHeaderProps = {
  title: string;
  description: string;
  badge?: string;
  variant?: "default" | "warm";
};

export function InventoryPageHeader({
  title,
  description,
  badge = "Inventario",
  variant = "default",
}: InventoryPageHeaderProps) {
  if (variant === "warm") {
    return (
      <header className="dashboard-hero inventory-warm-hero">
        <p className="eyebrow">{badge}</p>
        <h1 className="section-heading">{title}</h1>
        <p className="content-description">{description}</p>
      </header>
    );
  }

  return (
    <CardHeader>
      <div className="flex flex-wrap items-center gap-2">
        <CardTitle>{title}</CardTitle>
        <Badge variant="secondary">{badge}</Badge>
      </div>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  );
}
