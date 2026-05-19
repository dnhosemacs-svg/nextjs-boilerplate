import { cn } from "@/lib/utils";

type InventoryModuleProps = {
  children: React.ReactNode;
  className?: string;
};

/** Aísla variables y estilos shadcn del resto del panel (Carbon / tema taller). */
export function InventoryModule({ children, className }: InventoryModuleProps) {
  return (
    <div className={cn("inventory-module w-full", className)}>
      {children}
    </div>
  );
}
