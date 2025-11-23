export default function ContestLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header Skeleton */}
      <div className="mb-8 animate-pulse">
        <div className="mb-4 h-10 w-2/3 rounded-lg bg-muted"></div>
        <div className="h-5 w-full rounded bg-muted/60"></div>
        <div className="mt-2 h-5 w-4/5 rounded bg-muted/60"></div>
      </div>

      {/* Countdown Skeleton */}
      <div className="mb-8 rounded-lg border bg-primary/5 p-6">
        <div className="mb-4 flex justify-center">
          <div className="h-7 w-48 animate-pulse rounded bg-muted"></div>
        </div>
        <div className="flex justify-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <div className="h-12 w-16 animate-pulse rounded bg-muted"></div>
            <div className="h-4 w-12 animate-pulse rounded bg-muted/60"></div>
          </div>
          <div className="self-center">
            <div className="h-12 w-3 animate-pulse rounded bg-muted/60"></div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-12 w-16 animate-pulse rounded bg-muted"></div>
            <div className="h-4 w-12 animate-pulse rounded bg-muted/60"></div>
          </div>
          <div className="self-center">
            <div className="h-12 w-3 animate-pulse rounded bg-muted/60"></div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-12 w-16 animate-pulse rounded bg-muted"></div>
            <div className="h-4 w-12 animate-pulse rounded bg-muted/60"></div>
          </div>
        </div>
      </div>

      {/* Problem List Skeleton */}
      <div>
        <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-muted"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border p-6"
            >
              <div className="flex-1">
                <div className="mb-3 h-6 w-3/4 animate-pulse rounded bg-muted"></div>
                <div className="flex gap-3">
                  <div className="h-5 w-20 animate-pulse rounded-full bg-muted/60"></div>
                  <div className="h-5 w-16 animate-pulse rounded-full bg-muted/60"></div>
                </div>
              </div>
              <div className="ml-4 h-10 w-24 animate-pulse rounded-lg bg-muted"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
