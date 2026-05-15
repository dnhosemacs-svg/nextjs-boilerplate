import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import AuthRegisterForm from "@/components/auth-register-form";
import { authOptions } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="page-shell max-w-4xl items-start justify-center">
      <div className="w-full max-w-xl">
        <section className="surface-card login-layout">
          <header className="login-block flex flex-col gap-3">
            <p className="eyebrow">Alta de usuario</p>
            <h1 className="section-heading">Crear cuenta</h1>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              Regístrate para acceder al panel de pedidos del taller.
            </p>
          </header>

          <div className="login-block">
            <AuthRegisterForm />
          </div>

          <div className="login-actions flex flex-wrap gap-3">
            <Link href="/login" className="ui-pill ui-pill-secondary">
              ¿Ya tienes cuenta? Iniciar sesión
            </Link>
            <Link href="/" className="ui-pill ui-pill-secondary">
              Volver al inicio
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
