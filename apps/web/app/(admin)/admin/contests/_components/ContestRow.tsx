// /apps/web/app/(admin)/admin/contests/_components/ContestRow.tsx

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
 */
export function ContestRow({ contest }: ContestRowProps) {
  return (
    <Link
      href={`/admin/contests/${contest.id}`}
      className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
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
          <span className="flex items-center gap-1.5">
            <ClipboardList className="h-4 w-4" />
            {contest._count.problem} Problem{contest._count.problem !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Link>
  );
}