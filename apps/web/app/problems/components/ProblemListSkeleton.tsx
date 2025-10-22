// apps/web/app/problems/components/ProblemListSkeleton.tsx

export function ProblemListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Controls Skeleton */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="h-10 bg-muted rounded-md animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-muted rounded-md animate-pulse"></div>
          <div className="h-10 w-32 bg-muted rounded-md animate-pulse"></div>
        </div>
      </div>

      {/* Header Skeleton */}
      <div className="grid grid-cols-12 gap-4 py-3 px-4 border-b border-border">
        <div className="col-span-1">
          <div className="h-4 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="col-span-6">
          <div className="h-4 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="col-span-2">
          <div className="h-4 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="col-span-3">
          <div className="h-4 bg-muted rounded animate-pulse"></div>
        </div>
      </div>

      {/* Problem Rows Skeleton */}
      <div className="space-y-1">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="grid grid-cols-12 gap-4 py-4 px-4 hover:bg-accent/50 transition-colors border border-border rounded-lg">
            <div className="col-span-1 flex items-center">
              <div className="w-6 h-6 bg-muted rounded-full animate-pulse"></div>
            </div>
            <div className="col-span-6 flex items-center">
              <div className="h-5 bg-muted rounded animate-pulse w-3/4"></div>
            </div>
            <div className="col-span-2 flex items-center">
              <div className="h-5 w-16 bg-muted rounded-full animate-pulse"></div>
            </div>
            <div className="col-span-3 flex items-center">
              <div className="h-5 w-12 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}