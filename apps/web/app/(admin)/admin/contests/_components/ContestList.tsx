// /apps/web/app/(admin)/admin/contests/_components/ContestList.tsx

import { db } from '@repo/db';
import { ContestRow } from './ContestRow';
import { AdminEmptyState } from './AdminEmptyState';

/**
 * Fetches and displays the list of all contests.
 * This is a separate Server Component to allow streaming with Suspense.
 */
export async function ContestList() {
    const contests = await db.contest.findMany({
        orderBy: { startTime: 'desc' },
        include: {
            _count: {
                select: { problem: true }, // Count problems in each contest
            },
        },
    });

    if (contests.length === 0) {
        return (
            <AdminEmptyState
                title="No Contests Found"
                description="Get started by creating a new contest."
            />
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="divide-y divide-border">
                {contests.map((contest) => (
                    <ContestRow key={contest.id} contest={contest} />
                ))}
            </div>
        </div>
    );
}

/**
 * A simple skeleton loader for the contest list.
 */
export function ContestListSkeleton() {
    // Replaced <Card> with a styled <div>
    return (
        <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="divide-y divide-border">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4">
                        <div className="space-y-2">
                            <div className="h-5 w-48 animate-pulse rounded-md bg-muted" />
                            <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
                        </div>
                        <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                    </div>
                ))}
            </div>
        </div>
    );
}