import * as Sentry from "@sentry/nextjs";

type CaptureContext = {
  route: string;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
};

export function captureServerError(
  error: unknown,
  context: CaptureContext,
): void {
  if (!process.env.SENTRY_DSN) return;

  Sentry.withScope((scope) => {
    scope.setTag("route", context.route);
    if (context.tags) {
      for (const [key, value] of Object.entries(context.tags)) {
        scope.setTag(key, value);
      }
    }
    if (context.extra) {
      scope.setExtras(context.extra);
    }
    Sentry.captureException(error);
  });
}
