import TaskForm from "@/components/tasks/task-form";
import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function NewTaskPage() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get(AUTH_COOKIE_NAME)?.value === "1";
  if (!isAuthenticated) {
    redirect("/login?next=/tasks/new");
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
