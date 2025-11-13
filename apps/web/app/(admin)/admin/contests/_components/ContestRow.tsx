// /apps/web/app/(admin)/admin/contests/_components/ContestRow.tsx

import { memo } from 'react';
import type { Prisma } from '@prisma/client';
import Link from 'next/link';
import { ContestStatusBadge } from './ContestStatusBadge';
import { ChevronRight, ClipboardList } from 'lucide-react';

// Define the type for our contest prop, including the problem count
type ContestWithProblemCount = Prisma.ContestGetPayload<{
  include: {
    _count: {
      select: { problem: true };
    };
  };
}>;

interface ContestRowProps {
  contest: ContestWithProblemCount;
}

/**
 * Renders a single row in the ContestList.
 * 
 * Performance: Memoized to prevent unnecessary re-renders when parent re-renders
 */
const ContestRowComponent = ({ contest }: ContestRowProps) => {
  return (
    <Link
      href={`/admin/contests/${contest.id}`}
      className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`Edit contest: ${contest.title}`}
    >
      <div className="flex flex-col gap-1">
        <span className="text-lg font-semibold text-foreground">
          {contest.title}
        </span>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <ContestStatusBadge
            hidden={contest.hidden}
            startTime={contest.startTime}
            endTime={contest.endTime}
          />
          <span className="flex items-center gap-1.5" aria-label={`${contest._count.problem} problems`}>
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            {contest._count.problem} Problem{contest._count.problem !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
    </Link>
  );
};

// Export the memoized component
export const ContestRow = memo(ContestRowComponent);