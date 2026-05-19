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
};

export function InventoryPageHeader({
  title,
  description,
  badge = "Inventario",
}: InventoryPageHeaderProps) {
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
