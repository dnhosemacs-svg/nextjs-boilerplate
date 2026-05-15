import Link from "next/link";

import AuthLoginForm from "@/components/auth-login-form";
import SessionDebug from "@/components/session-debug";
import { isGithubOAuthConfigured } from "@/lib/server-env";

export default function LoginPage() {
  const githubOAuthEnabled = isGithubOAuthConfigured();
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

          <div className="login-block">
            <AuthLoginForm githubOAuthEnabled={githubOAuthEnabled} />
          </div>

          <div className="login-actions flex flex-wrap gap-3">
            <Link href="/register" className="ui-pill ui-pill-secondary">
              Crear cuenta
            </Link>
            <Link href="/" className="ui-pill ui-pill-secondary">
              Volver al inicio
            </Link>
          </div>
        </section>

        {process.env.NODE_ENV === "development" ? (
          <section
            className="mt-6"
            aria-label="Diagnóstico de sesión (solo desarrollo)"
          >
            <SessionDebug />
          </section>
        ) : null}
      </div>
    </main>
  );
}
