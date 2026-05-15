"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, PasswordInput, TextInput } from "@carbon/react";
import { signIn } from "next-auth/react";
import { getCredentialsSignInErrorMessage } from "@/lib/credentials-sign-in-errors";

const UNEXPECTED_ERROR_MESSAGE =
  "No se pudo iniciar sesión. Inténtalo de nuevo.";

function isSafeInternalPath(value: string | null): value is string {
  return !!value && value.startsWith("/") && !value.startsWith("//");
}

export default function AuthLoginForm() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSocialSubmitting, setIsSocialSubmitting] = useState(false);

  const postLoginDestination = useMemo(() => {
    const nextPath = searchParams.get("next");
    return isSafeInternalPath(nextPath) ? nextPath : "/dashboard";
  }, [searchParams]);

  const showRegisteredNotice = searchParams.get("registered") === "1";

  const isSubmitDisabled = useMemo(() => {
    return (
      isSubmitting ||
      isSocialSubmitting ||
      email.trim().length === 0 ||
      password.trim().length === 0
    );
  }, [email, password, isSubmitting, isSocialSubmitting]);

  async function onGitHubSignIn() {
    setError(null);
    setIsSocialSubmitting(true);
    try {
      await signIn("github", { callbackUrl: postLoginDestination });
    } catch (githubError) {
      const message =
        githubError instanceof Error
          ? githubError.message
          : "Error al iniciar sesión con GitHub.";
      setError(message);
      setIsSocialSubmitting(false);
    }
  }

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
      const result = await signIn("credentials", {
        email: normalizedEmail,
        password: normalizedPassword,
        redirect: false,
      });

      if (!result?.ok) {
        if (process.env.NODE_ENV === "development" && result?.error) {
          console.debug("[login] credentials failed:", result.error);
        }
        setError(getCredentialsSignInErrorMessage(result?.error));
        return;
      }

      window.location.href = postLoginDestination;
    } catch (submitError) {
      if (process.env.NODE_ENV === "development") {
        console.debug("[login] unexpected error:", submitError);
      }
      setError(UNEXPECTED_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-8 md:gap-10 carbon-shell" onSubmit={onSubmit}>
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          kind="secondary"
          disabled={isSubmitting || isSocialSubmitting}
          onClick={onGitHubSignIn}
          className="carbon-btn-secondary self-stretch md:self-start"
        >
          {isSocialSubmitting ? "Redirigiendo a GitHub..." : "Continuar con GitHub"}
        </Button>
        <p className="text-sm text-[var(--muted)]">O inicia sesión con email y contraseña.</p>
      </div>

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

      {showRegisteredNotice ? (
        <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-800 dark:text-green-300">
          Cuenta creada. Inicia sesión con tu email y contraseña.
        </p>
      ) : null}

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
