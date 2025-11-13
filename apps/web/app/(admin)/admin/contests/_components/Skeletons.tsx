// /apps/web/app/(admin)/admin/contests/_components/Skeletons.tsx

/**
 * Collection of skeleton loader components for contest admin pages.
 * Provides visual feedback during data fetching.
 */

export function ContestFormSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-4 h-6 w-40 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="col-span-2 space-y-2">
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
        </div>
        <div className="col-span-2 space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-24 w-full animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <div className="h-10 w-32 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function ProblemsListSkeleton() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between p-4 px-6">
        <div className="space-y-2">
          <div className="h-6 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="border-t">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 px-6">
            <div className="h-5 w-5 animate-pulse rounded bg-muted" />
            <div className="flex-1 space-y-1">
              <div className="h-5 w-48 animate-pulse rounded bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-10 w-24 animate-pulse rounded bg-muted" />
            <div className="h-10 w-16 animate-pulse rounded bg-muted" />
            <div className="h-10 w-10 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PublishControlsSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-4 h-6 w-32 animate-pulse rounded bg-muted" />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          <div className="h-6 w-12 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
