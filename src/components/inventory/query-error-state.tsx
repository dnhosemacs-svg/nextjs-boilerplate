"use client";

import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error-message";

type QueryErrorStateProps = {
  error: unknown;
  fallbackMessage: string;
  onRetry: () => void;
  className?: string;
};

export function QueryErrorState({
  error,
  fallbackMessage,
  onRetry,
  className,
}: QueryErrorStateProps) {
  return (
    <div className={className}>
      <p className="text-sm text-destructive">
        {getErrorMessage(error, fallbackMessage)}
      </p>
      <Button variant="outline" className="mt-2" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}
