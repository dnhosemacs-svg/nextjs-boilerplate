import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import AuthLoginForm from "@/components/auth-login-form";
import { authOptions } from "@/lib/auth";
import { getPostLoginDestination } from "@/lib/safe-redirect";
import {
  isGithubOAuthConfigured,
  isPublicRegistrationEnabled,
} from "@/lib/server-env";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const query = await searchParams;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === "string") params.set(key, value);
    }
    redirect(getPostLoginDestination(params));
  }

  const githubOAuthEnabled = isGithubOAuthConfigured();
  const publicRegistrationEnabled = isPublicRegistrationEnabled();
  return (
    <main className="page-shell login-page max-w-4xl justify-center">
      <div className="login-page-form w-full max-w-xl">
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
            {publicRegistrationEnabled ? (
              <Link href="/register" className="ui-pill ui-pill-secondary">
                Crear cuenta
              </Link>
            ) : null}
            <Link href="/" className="ui-pill ui-pill-secondary">
              Volver al inicio
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
