import Link from "next/link";

import AuthLoginForm from "@/components/auth-login-form";
import { DEMO_USER } from "@/lib/auth";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 px-6 py-14 md:py-16">
      <section className="flex w-full flex-col gap-10 rounded-2xl border border-black/10 bg-white p-8 shadow-sm md:gap-12 md:p-10 dark:border-white/15 dark:bg-black">
        <header className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
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
