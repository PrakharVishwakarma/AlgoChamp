// apps/web/app/contests/[contestId]/loading.tsx

export default function ContestLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl px-4 py-12">
        {/* Header Skeleton */}
        <div className="mb-8 space-y-4 animate-pulse">
          {/* Title and Status Badge */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="h-9 w-80 max-w-full rounded-lg bg-gradient-to-r from-muted to-muted/60"></div>
            <div className="h-7 w-20 rounded-full bg-muted/80"></div>
          </div>

          {/* Date and Time Info */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-muted/60"></div>
              <div className="h-4 w-64 rounded bg-muted/70"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-muted/60"></div>
              <div className="h-4 w-48 rounded bg-muted/70"></div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6 rounded-lg border bg-card p-6">
            <div className="mb-3 h-5 w-40 rounded bg-muted"></div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-muted/60"></div>
              <div className="h-4 w-11/12 rounded bg-muted/60"></div>
              <div className="h-4 w-4/5 rounded bg-muted/60"></div>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {/* Countdown Skeleton */}
          <div className="rounded-lg border bg-primary/5 p-8">
            <div className="mb-6 flex justify-center">
              <div className="h-6 w-48 rounded-lg bg-gradient-to-r from-muted to-muted/60 animate-pulse"></div>
            </div>
            <div className="flex justify-center gap-6">
              {/* Hours */}
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-20 rounded-lg bg-gradient-to-br from-muted via-muted/80 to-muted/60 animate-pulse"></div>
                <div className="h-3 w-14 rounded bg-muted/60 animate-pulse"></div>
              </div>
              {/* Separator */}
              <div className="flex items-center">
                <div className="h-12 w-2 rounded bg-muted/40 animate-pulse"></div>
              </div>
              {/* Minutes */}
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-20 rounded-lg bg-gradient-to-br from-muted via-muted/80 to-muted/60 animate-pulse"></div>
                <div className="h-3 w-14 rounded bg-muted/60 animate-pulse"></div>
              </div>
              {/* Separator */}
              <div className="flex items-center">
                <div className="h-12 w-2 rounded bg-muted/40 animate-pulse"></div>
              </div>
              {/* Seconds */}
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-20 rounded-lg bg-gradient-to-br from-muted via-muted/80 to-muted/60 animate-pulse"></div>
                <div className="h-3 w-14 rounded bg-muted/60 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Problem List Skeleton */}
          <div className="space-y-6">
            <div className="h-8 w-40 rounded-lg bg-gradient-to-r from-muted to-muted/60 animate-pulse"></div>
            
            <div className="rounded-lg border bg-card shadow-sm">
              <div className="divide-y divide-border">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-5 transition-opacity"
                    style={{
                      animationDelay: `${i * 100}ms`,
                    }}
                  >
                    {/* Left Side */}
                    <div className="flex items-center gap-4 flex-1">
                      {/* Problem Index Circle */}
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-muted to-muted/60 animate-pulse"></div>
                      
                      {/* Problem Details */}
                      <div className="flex-1 space-y-2">
                        <div className="h-5 w-3/4 max-w-md rounded bg-gradient-to-r from-muted to-muted/60 animate-pulse"></div>
                        <div className="flex items-center gap-3">
                          <div className="h-5 w-16 rounded-full bg-muted/70 animate-pulse"></div>
                          <div className="h-1 w-1 rounded-full bg-muted/40"></div>
                          <div className="h-4 w-20 rounded bg-muted/60 animate-pulse"></div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Button */}
                    <div className="ml-4">
                      <div className="h-9 w-24 rounded-lg bg-gradient-to-r from-muted to-muted/70 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard Skeleton */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded bg-muted/60 animate-pulse"></div>
                <div className="h-7 w-36 rounded-lg bg-gradient-to-r from-muted to-muted/60 animate-pulse"></div>
              </div>
              <div className="h-4 w-32 rounded bg-muted/60 animate-pulse"></div>
            </div>

            <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 border-b bg-muted/30 p-4">
                <div className="col-span-1 h-4 rounded bg-muted/60 animate-pulse"></div>
                <div className="col-span-4 h-4 rounded bg-muted/60 animate-pulse"></div>
                <div className="col-span-2 h-4 rounded bg-muted/60 animate-pulse"></div>
                <div className="col-span-2 h-4 rounded bg-muted/60 animate-pulse"></div>
                <div className="col-span-3 h-4 rounded bg-muted/60 animate-pulse"></div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-border">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-4 p-4"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="col-span-1 flex justify-center">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-muted to-muted/60 animate-pulse"></div>
                    </div>
                    <div className="col-span-4">
                      <div className="h-5 w-full max-w-xs rounded bg-gradient-to-r from-muted to-muted/60 animate-pulse"></div>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <div className="h-6 w-16 rounded-full bg-muted/70 animate-pulse"></div>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <div className="h-5 w-12 rounded bg-muted/60 animate-pulse"></div>
                    </div>
                    <div className="col-span-3 flex justify-end">
                      <div className="h-4 w-24 rounded bg-muted/60 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
