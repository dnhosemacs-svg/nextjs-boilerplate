"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, PasswordInput, TextInput } from "@carbon/react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { signIn } from "next-auth/react";
import { getFirebaseAuth } from "@/lib/firebase-client";
import {
  getFirebaseAuthErrorMessage,
  logFirebaseAuthError,
} from "@/lib/firebase-auth-errors";

const MIN_PASSWORD_LENGTH = 6;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function AuthRegisterForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubmitDisabled = useMemo(
    () =>
      isSubmitting ||
      email.trim().length === 0 ||
      password.trim().length === 0 ||
      confirmPassword.trim().length === 0,
    [email, password, confirmPassword, isSubmitting],
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    const normalizedConfirm = confirmPassword.trim();

    if (!normalizedEmail || !normalizedPassword || !normalizedConfirm) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      setError("Introduce un email válido.");
      return;
    }
    if (normalizedPassword.length < MIN_PASSWORD_LENGTH) {
      setError(
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      );
      return;
    }
    if (normalizedPassword !== normalizedConfirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);

    try {
      const auth = getFirebaseAuth();
      await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        normalizedPassword,
      );

      const result = await signIn("credentials", {
        email: normalizedEmail,
        password: normalizedPassword,
        redirect: false,
      });

      if (!result?.ok) {
        if (process.env.NODE_ENV === "development" && result?.error) {
          console.debug("[register] auto-login failed:", result.error);
        }
        router.push("/login?registered=1");
        return;
      }

      setSuccess("Cuenta creada. Redirigiendo al panel...");
      window.location.href = "/dashboard";
    } catch (registerError) {
      logFirebaseAuthError("register", registerError);
      setError(getFirebaseAuthErrorMessage(registerError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="flex flex-col gap-8 md:gap-10 carbon-shell"
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-6 md:gap-8">
        <TextInput
          labelText="Email"
          id="register-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          size="md"
          className="carbon-input"
        />

        <PasswordInput
          labelText="Contraseña"
          id="register-password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          size="md"
          className="carbon-input"
        />

        <PasswordInput
          labelText="Confirmar contraseña"
          id="register-confirm-password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          size="md"
          className="carbon-input"
        />
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-800 dark:text-green-300">
          {success}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitDisabled}
        kind="primary"
        className="carbon-btn-primary self-start"
      >
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
    </form>
  );
}
