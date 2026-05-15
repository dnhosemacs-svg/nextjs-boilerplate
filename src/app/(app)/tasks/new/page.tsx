import TaskForm from "@/components/tasks/task-form";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildLoginRedirectPath } from "@/lib/safe-redirect";

export default async function NewTaskPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(buildLoginRedirectPath("/tasks/new"));
  }

  return (
    <main className="page-shell max-w-4xl items-start">
      <section className="surface-card">
        <header className="mb-8 flex flex-col gap-3 md:mb-10">
          <h1 className="section-heading">Nuevo pedido</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            Registra un trabajo entrante para que el equipo lo vea en la lista y en estadísticas.
          </p>
        </header>

        <TaskForm mode="create" />
      </section>
    </main>
  );
}
