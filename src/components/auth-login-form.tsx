"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, PasswordInput, TextInput } from "@carbon/react";
import { signIn } from "next-auth/react";

function isSafeInternalPath(value: string | null): value is string {
  return !!value && value.startsWith("/") && !value.startsWith("//");
}

export default function AuthLoginForm() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubmitDisabled = useMemo(() => {
    return isSubmitting || email.trim().length === 0 || password.trim().length === 0;
  }, [email, password, isSubmitting]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      setError("Email y password son obligatorios.");
      return;
    }

    setIsSubmitting(true);

    try {
      const nextPath = searchParams.get("next");
      const destination = isSafeInternalPath(nextPath) ? nextPath : "/dashboard";

      const result = await signIn("credentials", {
        email: normalizedEmail,
        password: normalizedPassword,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciales inválidas.");
        return;
      }

      window.location.href = destination;
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Error inesperado";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-8 md:gap-10 carbon-shell" onSubmit={onSubmit}>
      <div className="flex flex-col gap-6 md:gap-8">
        <TextInput
          labelText="Email"
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          size="md"
          className="carbon-input"
        />

        <PasswordInput
          labelText="Password"
          id="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          size="md"
          className="carbon-input"
        />
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitDisabled}
        kind="primary"
        className="carbon-btn-primary self-start"
      >
        {isSubmitting ? "Entrando..." : "Iniciar sesion"}
      </Button>
    </form>
  );
}
