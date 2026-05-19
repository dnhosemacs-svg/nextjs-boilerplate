import { InventoryModule } from "@/components/inventory/inventory-module";
import { InventoryPageHeader } from "@/components/inventory/inventory-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ProductsPage() {
  return (
    <main className="page-shell max-w-5xl items-start">
      <InventoryModule>
        <Card>
          <InventoryPageHeader
            title="Productos"
            description="Listado de productos del taller. La API y el CRUD llegarán en tarjetas posteriores."
          />
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" disabled>
                Nuevo producto
              </Button>
              <Badge variant="outline">Próximamente</Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Sin productos registrados.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </InventoryModule>
    </main>
  );
}
