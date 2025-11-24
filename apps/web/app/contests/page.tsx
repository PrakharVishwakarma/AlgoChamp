// /apps/web/app/contests/page.tsx

import { Suspense } from "react";
import { db } from "@repo/db";
import { ClientNavigation } from "@/components/ClientNavigation";
import { Logo } from "@/components/Logo";
import { ContestCard } from "@/app/contests/_components/ContestCard";
import { ContestEmptyState } from "@/app/contests/_components/ContestEmptyState";
import { ContestCardSkeletonGrid } from "@/app/contests/_components/ContestCardSkeleton";
import { ContestWithStats } from "@/types/contest";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

// Separate fetch functions with different revalidation times
async function getLiveContests(): Promise<ContestWithStats[]> {
  const now = new Date();

  const contests = await db.contest.findMany({
    where: {
      hidden: false,
      deletedAt: null,
      startTime: { lte: now },
      endTime: { gte: now },
    },
    select: {
      id: true,
      title: true,
      description: true,
      startTime: true,
      endTime: true,
      hidden: true,
      leaderboard: true,
      _count: {
        select: {
          problem: true,
          contestsubmissions: true,
        },
      },
    },
    orderBy: {
      startTime: "desc",
    },
  });

  return contests;
}

getLiveContests.revalidate = 60; // Revalidate every 60 seconds for live contests

async function getUpcomingContests(): Promise<ContestWithStats[]> {
  const now = new Date();

  const contests = await db.contest.findMany({
    where: {
      hidden: false,
      deletedAt: null,
      startTime: { gt: now },
    },
    select: {
      id: true,
      title: true,
      description: true,
      startTime: true,
      endTime: true,
      hidden: true,
      leaderboard: true,
      _count: {
        select: {
          problem: true,
          contestsubmissions: true,
        },
      },
    },
    orderBy: {
      startTime: "asc", // Soonest first
    },
  });

  return contests;
}

getUpcomingContests.revalidate = 300; // Revalidate every 5 minutes for upcoming contests

async function getPastContests(limit = 6): Promise<ContestWithStats[]> {
  const now = new Date();

  const contests = await db.contest.findMany({
    where: {
      hidden: false,
      deletedAt: null,
      endTime: { lt: now },
    },
    select: {
      id: true,
      title: true,
      description: true,
      startTime: true,
      endTime: true,
      hidden: true,
      leaderboard: true,
      _count: {
        select: {
          problem: true,
          contestsubmissions: true,
        },
      },
    },
    orderBy: {
      endTime: "desc", // Most recent first
    },
    take: limit,
  });

  return contests;
}

getPastContests.revalidate = 3600; // Revalidate every hour for past contests

async function getUserSubmissionCounts(
  userId: string,
  contestIds: string[]
): Promise<Record<string, number>> {
  if (contestIds.length === 0) return {};

  const submissions = await db.contestSubmission.groupBy({
    by: ["contestId"],
    where: {
      userId,
      contestId: { in: contestIds },
    },
    _count: {
      id: true,
    },
  });

  return submissions.reduce(
    (acc, sub) => {
      acc[sub.contestId] = sub._count.id;
      return acc;
    },
    {} as Record<string, number>
  );
}

async function LiveContestsSection() {
  const contests = await getLiveContests();
  const session = await getServerSession(authOptions);

  let userSubmissions: Record<string, number> = {};
  if (session?.user?.id) {
    userSubmissions = await getUserSubmissionCounts(
      session.user.id,
      contests.map((c) => c.id)
    );
  }

  if (contests.length === 0) {
    return <ContestEmptyState status="live" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contests.map((contest) => (
        <ContestCard
          key={contest.id}
          contest={contest}
          status="live"
          userSubmissions={userSubmissions[contest.id]}
        />
      ))}
    </div>
  );
}

async function UpcomingContestsSection() {
  const contests = await getUpcomingContests();
  const session = await getServerSession(authOptions);

  let userSubmissions: Record<string, number> = {};
  if (session?.user?.id) {
    userSubmissions = await getUserSubmissionCounts(
      session.user.id,
      contests.map((c) => c.id)
    );
  }

  if (contests.length === 0) {
    return <ContestEmptyState status="upcoming" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contests.map((contest) => (
        <ContestCard
          key={contest.id}
          contest={contest}
          status="upcoming"
          userSubmissions={userSubmissions[contest.id]}
        />
      ))}
    </div>
  );
}

async function PastContestsSection() {
  const contests = await getPastContests();
  const session = await getServerSession(authOptions);

  let userSubmissions: Record<string, number> = {};
  if (session?.user?.id) {
    userSubmissions = await getUserSubmissionCounts(
      session.user.id,
      contests.map((c) => c.id)
    );
  }

  if (contests.length === 0) {
    return <ContestEmptyState status="past" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contests.map((contest) => (
        <ContestCard
          key={contest.id}
          contest={contest}
          status="past"
          userSubmissions={userSubmissions[contest.id]}
        />
      ))}
    </div>
  );
}

export default async function ContestsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <ClientNavigation />

      <main className="container mx-auto max-w-7xl px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <Logo size="lg" className="mx-auto" />
          <h1 className="mt-6 text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            AlgoChamp Contests
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Test your skills. Climb the ranks. Become a champion.
          </p>
        </div>

        <div className="space-y-12">
          {/* Live Contests */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Live Now
              </h2>
            </div>
            <Suspense fallback={<ContestCardSkeletonGrid count={3} />}>
              <LiveContestsSection />
            </Suspense>
          </section>

          {/* Upcoming Contests */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <svg
                className="w-6 h-6 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Upcoming
              </h2>
            </div>
            <Suspense fallback={<ContestCardSkeletonGrid count={3} />}>
              <UpcomingContestsSection />
            </Suspense>
          </section>

          {/* Past Contests */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <svg
                className="w-6 h-6 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Past Contests
              </h2>
            </div>
            <Suspense fallback={<ContestCardSkeletonGrid count={6} />}>
              <PastContestsSection />
            </Suspense>
          </section>
        </div>
      </main>
    </div>
  );
}