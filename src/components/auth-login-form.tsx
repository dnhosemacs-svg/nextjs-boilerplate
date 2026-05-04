"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, PasswordInput, TextInput } from "@carbon/react";

export default function AuthLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("admin@carpinteria.local");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "No se pudo iniciar sesión.");
      }

      const nextPath = searchParams.get("next");
      router.push(nextPath && nextPath.startsWith("/") ? nextPath : "/");
      router.refresh();
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Error inesperado";
      setError(message);
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
        disabled={isSubmitting}
        kind="primary"
        className="carbon-btn-primary self-start"
      >
        {isSubmitting ? "Entrando..." : "Iniciar sesión"}
      </Button>
    </form>
  );
}
