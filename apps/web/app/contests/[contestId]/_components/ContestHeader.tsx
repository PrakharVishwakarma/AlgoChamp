// apps/web/app/contests/[contestId]/_components/ContestHeader.tsx

import { Badge } from '@repo/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import type { Contest } from '@prisma/client';

interface ContestHeaderProps {
    contest: Contest;
    status: 'Upcoming' | 'Live' | 'Ended';
}

export function ContestHeader({ contest, status }: ContestHeaderProps) {
    const startTime = new Date(contest.startTime);
    const endTime = new Date(contest.endTime);
    const durationHours = Math.round(
        (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
    );

    let badgeVariant: 'outline' | 'secondary' | 'default' = 'outline';
    let badgeClass = '';

    if (status === 'Live') {
        badgeVariant = 'outline';
        badgeClass = 'text-green-600 border-green-600 animate-pulse';
    } else if (status === 'Upcoming') {
        badgeVariant = 'outline';
        badgeClass = 'text-blue-600 border-blue-600';
    } else {
        badgeVariant = 'secondary';
    }

    return (
        <div className="mb-8 space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h1 className="text-3xl font-bold text-foreground">{contest.title}</h1>
                <Badge variant={badgeVariant} className={`w-fit px-4 py-1 ${badgeClass}`}>
                    {status}
                </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                        {startTime.toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                        {startTime.toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                        {' - '}
                        {endTime.toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                        {' ('}
                        {durationHours} hours)
                    </span>
                </div>
            </div>

            {contest.description && (
                <div className="mt-6 rounded-lg border bg-card p-6 text-card-foreground">
                    <h3 className="mb-2 font-semibold">About this Contest</h3>
                    <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                        {contest.description}
                    </p>
                </div>
            )}
        </div>
    );
}