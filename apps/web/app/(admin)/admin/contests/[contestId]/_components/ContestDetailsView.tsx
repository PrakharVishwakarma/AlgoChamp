// /apps/web/app/(admin)/admin/contests/[contestId]/_components/ContestDetailsView.tsx

'use client';

import { memo } from 'react';
import type { Contest } from '@prisma/client';
import { Button } from '@repo/ui/button';
import { Calendar, Clock, FileText, Edit2 } from 'lucide-react';
import { ContestStatusBadge } from '../../_components/ContestStatusBadge';

interface ContestDetailsViewProps {
  contest: Contest;
  onEdit: () => void;
}

/**
 * Read-only view of contest details.
 * Displays all contest information with an Edit button.
 * 
 * Features:
 * - Clean, scannable layout
 * - Visual status indicators
 * - Formatted dates and times
 * - Accessible markup
 */
const ContestDetailsViewComponent = ({ contest, onEdit }: ContestDetailsViewProps) => {
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date));
  };

  const getDuration = () => {
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours >= 24) {
      const days = Math.floor(diffHours / 24);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes} minutes`;
  };

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-6">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">Contest Details</h3>
          <p className="text-sm text-muted-foreground">
            View and manage contest information
          </p>
        </div>
        <Button onClick={onEdit} aria-label="Edit contest details" icon={Edit2}>
          Edit
        </Button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="text-sm font-medium text-muted-foreground">Title</label>
          <p className="mt-1 text-base font-semibold text-foreground">{contest.title}</p>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Description
          </label>
          {contest.description ? (
            <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
              {contest.description}
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground italic">
              No description provided
            </p>
          )}
        </div>

        {/* Status & Visibility */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <div className="mt-1">
              <ContestStatusBadge
                hidden={contest.hidden}
                startTime={contest.startTime}
                endTime={contest.endTime}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Visibility</label>
            <p className="mt-1 text-sm">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  contest.hidden
                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                }`}
              >
                {contest.hidden ? 'Hidden' : 'Visible'}
              </span>
            </p>
          </div>
        </div>

        {/* Time Details */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Start Time */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Start Time
            </label>
            <p className="mt-1 text-sm text-foreground font-medium">
              {formatDateTime(contest.startTime)}
            </p>
          </div>

          {/* End Time */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              End Time
            </label>
            <p className="mt-1 text-sm text-foreground font-medium">
              {formatDateTime(contest.endTime)}
            </p>
          </div>

          {/* Duration */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duration
            </label>
            <p className="mt-1 text-sm text-foreground font-medium">
              {getDuration()}
            </p>
          </div>
        </div>

        {/* Metadata */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 gap-4 text-xs text-muted-foreground sm:grid-cols-2">
            <div>
              <span className="font-medium">Created:</span>{' '}
              {new Date(contest.createdAt).toLocaleDateString('en-US', {
                dateStyle: 'long',
              })}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>{' '}
              {new Date(contest.updatedAt).toLocaleDateString('en-US', {
                dateStyle: 'long',
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContestDetailsView = memo(ContestDetailsViewComponent);
