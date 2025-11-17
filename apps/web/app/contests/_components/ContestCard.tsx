// /apps/web/app/contests/_components/ContestCard.tsx

import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { Badge } from '@repo/ui/badge'; // Use our new centralized badge
import { Calendar, ClipboardList, Clock } from 'lucide-react';

// Get the type for our contest prop, including the problem count
type ContestWithProblemCount = Prisma.ContestGetPayload<{
  include: {
    _count: {
      select: { problem: true };
    };
  };
}>;

interface ContestCardProps {
  contest: ContestWithProblemCount;
}

/**
 * A reusable card component to display contest info in the Lobby.
 */
export function ContestCard({ contest }: ContestCardProps) {
  const now = new Date();
  let status: 'Live' | 'Scheduled' | 'Ended' = 'Scheduled';
  let badgeVariant: 'outline' | 'secondary' = 'outline';
  let badgeClasses = 'text-blue-600 border-blue-600'; // Scheduled

  if (now < contest.startTime) {
    status = 'Scheduled';
  } else if (now >= contest.startTime && now <= contest.endTime) {
    status = 'Live';
    badgeClasses = 'text-green-600 border-green-600';
  } else {
    status = 'Ended';
    badgeVariant = 'secondary';
    badgeClasses = ''; // Use default secondary styles
  }

  return (
    <Link
      href={`/contests/${contest.id}`}
      className="block rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
    >
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-foreground">
            {contest.title}
          </h3>
          <Badge variant={badgeVariant} className={badgeClasses}>
            {status}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-6 border-t bg-muted/50 p-5 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {contest.startTime.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {Math.floor(
            (contest.endTime.getTime() - contest.startTime.getTime()) /
              (1000 * 60 * 60),
          )}{' '}
          Hours
        </span>
        <span className="flex items-center gap-1.5">
          <ClipboardList className="h-4 w-4" />
          {contest._count.problem} Problem{contest._count.problem !== 1 ? 's' : ''}
        </span>
      </div>
    </Link>
  );
}