'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ContestError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service (e.g., Sentry)
    console.error('Contest page error:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mb-6 flex justify-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
      </div>
      
      <h2 className="mb-4 text-2xl font-bold">Something went wrong!</h2>
      
      <p className="mb-8 text-muted-foreground">
        We encountered an error while loading this contest. This might be a temporary issue.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try Again
        </button>
        
        <Link
          href="/contests"
          className="rounded-lg border bg-background px-6 py-3 font-medium transition-colors hover:bg-accent"
        >
          Back to Contests
        </Link>
      </div>

      {error.digest && (
        <p className="mt-8 font-mono text-xs text-muted-foreground">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
