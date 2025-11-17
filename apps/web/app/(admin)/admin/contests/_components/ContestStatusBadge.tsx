// /apps/web/app/(admin)/admin/contests/_components/ContestStatusBadge.tsx

import {Badge} from '@repo/ui/badge';

interface ContestStatusBadgeProps {
  hidden: boolean;
  startTime: Date;
  endTime: Date;
}

/**
 * Displays a badge with the current status of the contest.
 */
export function ContestStatusBadge({
  hidden,
  startTime,
  endTime,
}: ContestStatusBadgeProps) {
  const now = new Date();

  if (hidden) {
    return <Badge variant="secondary">Draft</Badge>;
  }

  if (now < startTime) {
    return (
      <Badge variant="outline" className="text-blue-600 border-blue-600">
        Scheduled
      </Badge>
    );
  }

  if (now >= startTime && now <= endTime) {
    return (
      <Badge variant="outline" className="text-green-600 border-green-600">
        Live
      </Badge>
    );
  }

  if (now > endTime) {
    return (
      <Badge variant="outline" className="text-red-600 border-red-600">
        Ended
      </Badge>
    );
  }

  return null;
}