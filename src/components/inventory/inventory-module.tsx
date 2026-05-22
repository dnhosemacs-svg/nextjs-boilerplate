import { cn } from "@/lib/utils";

type InventoryModuleProps = {
  children: React.ReactNode;
  className?: string;
  /** Tema taller (dashboard); por defecto shadcn neutro. */
  variant?: "default" | "warm";
};

/** Aísla variables y estilos shadcn del resto del panel (Carbon / tema taller). */
export function InventoryModule({
  children,
  className,
  variant = "default",
}: InventoryModuleProps) {
  return (
    <div
      className={cn(
        "w-full",
        variant === "warm" ? "inventory-warm-module" : "inventory-module",
        className,
      )}
    >
      {children}
    </div>
  );
}
