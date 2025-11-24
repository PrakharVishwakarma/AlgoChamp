// apps/web/app/contests/[contestId]/page.tsx

import { db } from '@repo/db';
import { notFound } from 'next/navigation';
import { authOptions } from '@/app/lib/auth';
import { getServerSession } from 'next-auth';
import { ContestHeader } from './_components/ContestHeader';
import { ContestCountdown } from './_components/ContestCountdown';
import { ContestProblemList } from './_components/ContestProblemList';
import { RegisterOnMount } from './_components/RegisterOnMount';
import { ContestLeaderboard } from './_components/ContestLeaderboard';
import { ContestRules } from './_components/ContestRules';
import type { Prisma, Contest } from '@prisma/client';
import type { Metadata } from 'next'; 
import { ClientNavigation } from '@/components/ClientNavigation';
// Force dynamic rendering to ensure time-based states are always accurate
export const dynamic = 'force-dynamic';

interface ContestPageProps {
    params: Promise<{
        contestId: string;
    }>;
}

// Define the exact type returned by our Prisma query below
type ContestProblemWithProblem = Prisma.ContestProblemGetPayload<{
    include: {
        problem: {
            select: {
                title: true;
                slug: true;
                difficulty: true;
            };
        };
    };
}>;

type ContestWithDetails = Pick<Contest, 'id' | 'title' | 'description' | 'startTime' | 'endTime' | 'hidden' | 'deletedAt' | 'leaderboard' | 'createdAt' | 'updatedAt' | 'allowVirtual' | 'maxParticipants'>;

// SEO Metadata Generation
export async function generateMetadata({ params }: ContestPageProps): Promise<Metadata> {
    const { contestId } = await params;
    
    const contest = await db.contest.findFirst({
        where: {
            id: contestId,
            hidden: false,
            deletedAt: null,
        },
        select: {
            title: true,
            description: true,
        },
    });

    if (!contest) {
        return {
            title: 'Contest Not Found | AlgoChamp',
            description: 'The contest you are looking for does not exist or has been removed.',
        };
    }

    return {
        title: `${contest.title} | AlgoChamp Contests`,
        description: contest.description || `Participate in ${contest.title} on AlgoChamp - Test your coding skills and compete with others.`,
        openGraph: {
            title: contest.title,
            description: contest.description || undefined,
            type: 'website',
        },
    };
}

export default async function ContestPage({ params }: ContestPageProps) {
    const { contestId } = await params;

    // 1. Parallel Fetch: Contest Metadata + Session
    const [contest, session] = await Promise.all([
        db.contest.findFirst({
            where: {
                id: contestId,
                hidden: false,
                deletedAt: null, // ✅ Soft-delete check
            },
            select: {
                id: true,
                title: true,
                description: true,
                startTime: true,
                endTime: true,
                hidden: true,
                deletedAt: true,
                leaderboard: true,
                allowVirtual: true,
                maxParticipants: true,
                createdAt: true,
                updatedAt: true,
            },
        }) as Promise<ContestWithDetails | null>,
        getServerSession(authOptions),
    ]);

    if (!contest) {
        notFound();
    }

    // 2. Determine State
    const now = new Date();
    const isLoggedIn = !!session?.user;

    const isUpcoming = now < contest.startTime;
    const isLive = now >= contest.startTime && now <= contest.endTime;
    const isEnded = now > contest.endTime;

    // 3. Security Veil & Optimized Data Loading
    // ✅ Only fetch problems if not upcoming (prevent leak)
    const problems: ContestProblemWithProblem[] = !isUpcoming
        ? await db.contestProblem.findMany({
              where: { contestId: contest.id },
              orderBy: { index: 'asc' },
              include: {
                  problem: {
                      select: {
                          title: true,
                          slug: true,
                          difficulty: true,
                      },
                  },
              },
          })
        : [];

    // 4. Fetch leaderboard data for live and ended contests
    const leaderboardData = isLive || isEnded 
        ? await db.contestPoints.findMany({
              where: { contestId: contest.id },
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
                  { lastSuccessfulSubmissionAt: 'asc' }, // Tie-breaker: earlier submission wins
              ],
              take: 100, // Top 100 for initial load
          })
        : [];

    // Transform leaderboard data
    const leaderboard = leaderboardData.map((entry, index) => {
        // Count solved problems
        const userName = entry.user.firstName && entry.user.lastName
            ? `${entry.user.firstName} ${entry.user.lastName}`
            : (entry.user.email?.split('@')[0] || 'Anonymous');

        return {
            rank: index + 1, // Recalculate rank based on sort order
            userId: entry.userId,
            userName: userName, // Explicitly ensure it's a string
            points: entry.points,
            solvedCount: Math.floor(entry.points / 100), // Assuming 100 points per problem
            lastSubmissionTime: entry.lastSuccessfulSubmissionAt,
        };
    });

    return (
        <div className="min-h-screen bg-background">
            <ClientNavigation />
            <main className="container mx-auto max-w-5xl px-4 py-12">
                {/* 1. The Auto-Pilot: Register user if logged in and contest is active */}
                {isLoggedIn && (isUpcoming || isLive) && (
                    <RegisterOnMount contestId={contest.id} />
                )}

                {/* 2. The Header: Always visible */}
                <ContestHeader
                    contest={contest}
                    status={isUpcoming ? 'Upcoming' : isLive ? 'Live' : 'Ended'}
                />


                <div className="space-y-10">
                    {/* 3. State Machine UI */}

                    {/* STATE A: UPCOMING */}
                    {isUpcoming && (
                        <div className="flex flex-col items-center justify-center py-10">
                            <div className="w-full max-w-2xl">
                                <ContestCountdown
                                    targetDate={contest.startTime}
                                    label="Contest Starts In"
                                />
                            </div>
                            <p className="mt-8 text-center text-muted-foreground">
                                The problem list will be revealed when the timer hits zero.
                                <br />
                                {isLoggedIn
                                    ? "You are automatically registered for this contest."
                                    : "Sign in to participate in the leaderboard."}
                            </p>
                        </div>
                    )}

                    {/* STATE B: LIVE */}
                    {isLive && (
                        <div className="space-y-8">
                            {/* Problems Section */}
                            <div>
                                <ContestProblemList
                                    contestId={contest.id}
                                    problems={problems}
                                />
                            </div>

                            {/* Leaderboard Section */}
                            <div>
                                <ContestLeaderboard
                                    contestId={contest.id}
                                    initialData={leaderboard}
                                    currentUserId={session?.user?.id}
                                    isLive={true}
                                />
                            </div>
                        </div>
                    )}

                    {/* STATE C: ENDED */}
                    {isEnded && (
                        <div className="space-y-10">
                            <div className="rounded-lg border bg-muted/30 p-8 text-center">
                                <h2 className="mb-2 text-2xl font-bold">Contest Has Ended</h2>
                                <p className="mb-6 text-muted-foreground">
                                    Check the final standings and practice problems below.
                                </p>
                            </div>

                            {/* Final Leaderboard */}
                            <ContestLeaderboard
                                contestId={contest.id}
                                initialData={leaderboard}
                                currentUserId={session?.user?.id}
                                isLive={false}
                            />

                            {/* Problems for Upsolving */}
                            <div className="pt-8 border-t">
                                <h3 className="text-xl font-bold mb-4">Practice Problems</h3>
                                <ContestProblemList
                                    contestId={contest.id}
                                    problems={problems}
                                    isEnded={true}
                                />
                            </div>
                        </div>
                    )}
                </div>
            {/* 3. Contest Rules - Always visible */}
            <ContestRules />
            </main>
        </div>
    );
}