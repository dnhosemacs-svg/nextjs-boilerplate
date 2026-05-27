import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import AuthRegisterForm from "@/components/auth-register-form";
import { authOptions } from "@/lib/auth";
import { getPostLoginDestination } from "@/lib/safe-redirect";
import { isPublicRegistrationEnabled } from "@/lib/server-env";

type RegisterPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  if (!isPublicRegistrationEnabled()) {
    redirect("/login");
  }

  const session = await getServerSession(authOptions);
  if (session?.user) {
    const query = await searchParams;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === "string") params.set(key, value);
    }
    redirect(getPostLoginDestination(params));
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
