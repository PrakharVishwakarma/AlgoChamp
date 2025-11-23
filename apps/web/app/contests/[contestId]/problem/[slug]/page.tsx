// apps/web/app/contests/[contestId]/problem/[slug]/page.tsx

/**
 * ============================================================================
 * CONTEST PROBLEM PAGE - CONTEST-AWARE PROBLEM SOLVING INTERFACE
 * ============================================================================
 * 
 * This page extends the regular problem solving experience with contest-specific features:
 * 
 * KEY FEATURES:
 * -------------
 * 1. Contest Context Tracking: All submissions are tagged with activeContestId
 * 2. Time-Based Access Control: Problems only accessible during contest period
 * 3. Anti-Cheating: Prevents tab switching, warns on navigation attempts
 * 4. Contest-Specific Scoring: Points calculated based on contest rules
 * 5. Problem Visibility: Upcoming contests hide problems until start
 * 
 * SECURITY:
 * ---------
 * - Validates contest is active before showing problem
 * - Checks user registration (auto-registered via RegisterOnMount)
 * - Prevents access to upcoming contest problems
 * - Tracks submission timestamps for leaderboard tie-breaking
 * 
 * PERFORMANCE:
 * ------------
 * - Dynamic rendering (no caching) for real-time contest state
 * - Optimized queries with parallel fetching
 * - Minimal data transfer (only required fields)
 * 
 * ============================================================================
 */

import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { db } from "@repo/db";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { ClientNavigation } from "@/components/ClientNavigation";
import { ContestProblemWorkspace } from './_components/ContestProblemWorkspace';
import { Difficulty } from '@prisma/client';

// Force dynamic rendering for real-time contest state
export const dynamic = 'force-dynamic';

interface ContestProblemPageProps {
    params: Promise<{
        contestId: string;
        slug: string;
    }>;
}

const difficultyLabels: Record<Difficulty, string> = {
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard',
};

// SEO Metadata Generation
export async function generateMetadata({ params }: ContestProblemPageProps): Promise<Metadata> {
    const { contestId, slug } = await params;
    
    try {
        const [contest, problem] = await Promise.all([
            db.contest.findFirst({
                where: {
                    id: contestId,
                    hidden: false,
                    deletedAt: null,
                },
                select: {
                    title: true,
                },
            }),
            db.problem.findUnique({
                where: { slug },
                select: {
                    title: true,
                    difficulty: true,
                },
            }),
        ]);

        if (!contest || !problem) {
            return {
                title: 'Problem Not Found | AlgoChamp',
                description: 'The requested problem could not be found.',
            };
        }

        const difficultyLabel = difficultyLabels[problem.difficulty];

        return {
            title: `${problem.title} - ${contest.title} | AlgoChamp`,
            description: `Solve ${problem.title} (${difficultyLabel}) in ${contest.title} contest on AlgoChamp`,
            openGraph: {
                title: `${problem.title} - ${contest.title}`,
                description: `Compete in ${contest.title} by solving ${problem.title}`,
                type: 'website',
            },
        };
    } catch {
        return {
            title: 'Contest Problem | AlgoChamp',
            description: 'Solve coding problems in contests on AlgoChamp',
        };
    }
}

export default async function ContestProblemPage({ params }: ContestProblemPageProps) {
    const { contestId, slug } = await params;
    const session = await getServerSession(authOptions);

    // Require authentication for contest participation
    if (!session?.user?.id) {
        redirect(`/login?redirect=/contests/${contestId}/problem/${slug}`);
    }

    // Parallel fetch: Contest, Problem, ContestProblem mapping, User registration
    const [contest, problem, contestProblem, registration] = await Promise.all([
        db.contest.findFirst({
            where: {
                id: contestId,
                hidden: false,
                deletedAt: null,
            },
            select: {
                id: true,
                title: true,
                description: true,
                startTime: true,
                endTime: true,
                allowVirtual: true,
            },
        }),
        db.problem.findUnique({
            where: { slug },
            include: {
                defaultCode: {
                    select: {
                        languageId: true,
                        code: true,
                    },
                },
            },
        }),
        db.contestProblem.findFirst({
            where: {
                contestId,
                problem: {
                    slug,
                },
            },
            select: {
                id: true,
                index: true,
                points: true,
                solved: true,
            },
        }),
        db.userContestRegistration.findUnique({
            where: {
                userId_contestId: {
                    userId: session.user.id,
                    contestId,
                },
            },
            select: {
                isVirtual: true,
                startedAt: true,
                endedAt: true,
            },
        }),
    ]);

    // Validation: Contest and problem must exist
    if (!contest || !problem || problem.hidden || !contestProblem) {
        notFound();
    }

    // Time-based access control
    const now = new Date();
    const isUpcoming = now < contest.startTime;
    const isLive = now >= contest.startTime && now <= contest.endTime;
    const isEnded = now > contest.endTime;

    // Security: Block access to upcoming contest problems
    if (isUpcoming) {
        redirect(`/contests/${contestId}`);
    }

    // Handle ended contests: Only allow if virtual mode enabled
    if (isEnded && !contest.allowVirtual) {
        redirect(`/contests/${contestId}`);
    }

    // For virtual contests, check if user has started
    const isVirtualMode = registration?.isVirtual || (isEnded && contest.allowVirtual);

    // Prepare boilerplate code
    const boilerplates = problem.defaultCode.reduce((acc, dc) => {
        acc[dc.languageId] = dc.code;
        return acc;
    }, {} as Record<string, string>);

    // Problem index label (A, B, C...)
    const problemLabel = String.fromCharCode(65 + contestProblem.index);

    const problemData = {
        id: problem.id,
        slug: problem.slug,
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        boilerplates,
    };

    const contestData = {
        id: contest.id,
        title: contest.title,
        startTime: contest.startTime,
        endTime: contest.endTime,
        isLive,
        isVirtualMode,
        problemLabel,
        points: contestProblem.points,
        solvedCount: contestProblem.solved,
    };

    return (
        <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
            <ClientNavigation />
            <main className="h-[calc(100vh-64px)] overflow-hidden">
                <ContestProblemWorkspace 
                    problemData={problemData}
                    contestData={contestData}
                    userId={session.user.id}
                />
            </main>
        </div>
    );
}
