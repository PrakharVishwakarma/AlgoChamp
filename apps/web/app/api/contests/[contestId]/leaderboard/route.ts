// apps/web/app/api/contests/[contestId]/leaderboard/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@repo/db';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ contestId: string }> }
) {
    try {
        const { contestId } = await params;

        // Fetch contest to verify it exists
        const contest = await db.contest.findFirst({
            where: {
                id: contestId,
                hidden: false,
                deletedAt: null,
            },
            select: {
                id: true,
            },
        });

        if (!contest) {
            return NextResponse.json(
                { error: 'Contest not found' },
                { status: 404 }
            );
        }

        // Fetch leaderboard data
        const leaderboardData = await db.contestPoints.findMany({
            where: { contestId },
            select: {
                userId: true,
                points: true,
                rank: true,
                lastSuccessfulSubmissionAt: true,
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: [
                { points: 'desc' },
                { lastSuccessfulSubmissionAt: 'asc' },
            ],
            take: 100, // Top 100
        });

        // Transform leaderboard data
        const leaderboard = leaderboardData.map((entry, index) => {
            const userName = entry.user.firstName && entry.user.lastName
                ? `${entry.user.firstName} ${entry.user.lastName}`
                : entry.user.email.split('@')[0];

            return {
                rank: index + 1,
                userId: entry.userId,
                userName,
                points: entry.points,
                solvedCount: Math.floor(entry.points / 100),
                lastSubmissionTime: entry.lastSuccessfulSubmissionAt,
            };
        });

        return NextResponse.json({
            success: true,
            leaderboard,
        });

    } catch (error) {
        console.error('[LEADERBOARD_API_ERROR]', error);
        return NextResponse.json(
            { error: 'Failed to fetch leaderboard' },
            { status: 500 }
        );
    }
}
