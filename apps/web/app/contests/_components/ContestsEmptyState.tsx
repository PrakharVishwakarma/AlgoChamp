// /apps/web/app/contests/_components/ContestsEmptyState.tsx

import { Trophy } from 'lucide-react';

export function ContestsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
        <Trophy className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-foreground">
        No Contests Available
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        There are no public contests at the moment. Please check back soon!
      </p>
    </div>
  );
}