import Link from "next/link";

import AuthLoginForm from "@/components/auth-login-form";
import { DEMO_USER } from "@/lib/auth";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 px-6 py-12">
      <section className="w-full rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/15 dark:bg-black">
        <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Accede para gestionar pedidos en las rutas protegidas.
        </p>

        <div className="mt-4 rounded-lg border border-dashed border-black/15 p-3 text-xs dark:border-white/20">
          Demo usuario: <strong>{DEMO_USER.email}</strong> · clave:{" "}
          <strong>{DEMO_USER.password}</strong>
        </div>

        <AuthLoginForm />

        <div className="mt-8">
          <Link
            href="/"
            className="ui-pill ui-pill-secondary"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
