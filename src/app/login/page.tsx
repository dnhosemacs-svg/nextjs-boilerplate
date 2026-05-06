import Link from "next/link";

import AuthLoginForm from "@/components/auth-login-form";
import { DEMO_USER } from "@/lib/auth";

export default function LoginPage() {
  return (
    <main className="page-shell max-w-4xl items-start justify-center">
      <div className="w-full max-w-xl">
        <section className="surface-card login-layout">
          <header className="login-block flex flex-col gap-3">
            <p className="eyebrow">Acceso interno</p>
            <h1 className="section-heading">Iniciar sesión</h1>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              Accede para gestionar pedidos en las rutas protegidas.
            </p>
          </header>

          <div className="login-demo-banner login-block">
            Demo usuario: <strong>{DEMO_USER.email}</strong> · clave:{" "}
            <strong>{DEMO_USER.password}</strong>
          </div>

          <div className="login-block">
            <AuthLoginForm />
          </div>

          <div className="login-actions">
            <Link href="/" className="ui-pill ui-pill-secondary self-start">
              Volver al inicio
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
