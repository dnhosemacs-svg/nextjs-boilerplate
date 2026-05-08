import Link from "next/link";

export default function NewTaskFab() {
  return (
    <Link href="/tasks/new" className="private-fab" aria-label="Crear nuevo pedido">
      Nuevo pedido
    </Link>
  );
}
