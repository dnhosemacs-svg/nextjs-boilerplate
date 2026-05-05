import Link from "next/link";

import AuthLoginForm from "@/components/auth-login-form";
import { DEMO_USER } from "@/lib/auth";

export default function LoginPage() {
  return (
    <main className="page-shell max-w-xl">
      <section className="surface-card flex flex-col gap-10 md:gap-12">
        <header className="flex flex-col gap-3">
          <h1 className="section-heading">Iniciar sesión</h1>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Accede para gestionar pedidos en las rutas protegidas.
          </p>
        </header>

        <div className="rounded-lg border border-dashed border-black/15 p-4 text-xs leading-relaxed dark:border-white/20 md:p-5">
          Demo usuario: <strong>{DEMO_USER.email}</strong> · clave:{" "}
          <strong>{DEMO_USER.password}</strong>
        </div>

        <AuthLoginForm />

        <div className="flex flex-col gap-4">
          <Link href="/" className="ui-pill ui-pill-secondary self-start">
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
