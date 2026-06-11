import * as Sentry from "@sentry/nextjs";

export function logServerWarning(
  message: string,
  context?: Record<string, unknown>,
): void {
  if (!process.env.SENTRY_DSN) return;

  if (context) {
    Sentry.captureMessage(message, {
      level: "warning",
      extra: context,
    });
    return;
  }

  Sentry.captureMessage(message, { level: "warning" });
}

export function logServerError(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  if (!process.env.SENTRY_DSN) return;

  if (context) {
    Sentry.withScope((scope) => {
      scope.setExtras(context);
      Sentry.captureException(error);
    });
    return;
  }

  Sentry.captureException(error);
}
