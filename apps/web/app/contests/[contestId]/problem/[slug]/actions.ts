// apps/web/app/contests/[contestId]/problem/[slug]/actions.ts

'use server';

import { db } from '@repo/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { LANGUAGE_MAPPING } from '@repo/common/language';
import { SupportedLanguage } from '@/components/problem/ProblemWorkspace';
import { SubmissionStatus } from '@prisma/client';

interface SubmitContestProblemParams {
    problemId: string;
    contestId: string;
    code: string;
    language: SupportedLanguage;
    fullCode: string;
}

interface SubmitResult {
    success: boolean;
    submissionId?: string;
    error?: string;
}

/**
 * Submit a problem solution within a contest context
 * This tracks the submission in both Submission and ContestSubmission tables
 */
export async function submitContestProblem(params: SubmitContestProblemParams): Promise<SubmitResult> {
    const { problemId, contestId, code, language, fullCode } = params;

    try {
        // 1. Authenticate user
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { success: false, error: 'Not authenticated' };
        }

        const userId = session.user.id;

        // 2. Validate contest exists and is accessible
        const contest = await db.contest.findFirst({
            where: {
                id: contestId,
                hidden: false,
                deletedAt: null,
            },
            select: {
                id: true,
                startTime: true,
                endTime: true,
                allowVirtual: true,
            },
        });

        if (!contest) {
            return { success: false, error: 'Contest not found' };
        }

        // 3. Check contest timing
        const now = new Date();
        const isLive = now >= contest.startTime && now <= contest.endTime;
        const isEnded = now > contest.endTime;

        if (!isLive && (!isEnded || !contest.allowVirtual)) {
            return { success: false, error: 'Contest is not active' };
        }

        // 4. Verify user is registered for contest
        const registration = await db.userContestRegistration.findUnique({
            where: {
                userId_contestId: {
                    userId,
                    contestId,
                },
            },
        });

        // Auto-register if not registered (fallback safety)
        if (!registration) {
            await db.userContestRegistration.create({
                data: {
                    userId,
                    contestId,
                    isVirtual: isEnded,
                    startedAt: isEnded ? now : null,
                },
            });
        }

        // 5. Get language ID
        const languageData = LANGUAGE_MAPPING[language];
        if (!languageData) {
            return { success: false, error: 'Unsupported language' };
        }

        const languageRecord = await db.language.findFirst({
            where: { judge0Id: languageData.judge0 },
        });

        if (!languageRecord) {
            return { success: false, error: 'Language not configured' };
        }

        // 6. Get contest problem points
        const contestProblem = await db.contestProblem.findFirst({
            where: {
                contestId,
                problemId,
            },
            select: {
                points: true,
            },
        });

        if (!contestProblem) {
            return { success: false, error: 'Problem not found in contest' };
        }

        // 7. Create main submission (with activeContestId for tracking)
        const submission = await db.submission.create({
            data: {
                userId,
                problemId,
                languageId: languageRecord.id,
                code,
                fullCode,
                activeContestId: contestId, // Link to active contest
                status: SubmissionStatus.PENDING,
            },
        });

        // 8. Create contest submission record (for contest-specific tracking)
        // Note: Points will be updated by webhook when status becomes AC
        await db.contestSubmission.create({
            data: {
                userId,
                problemId,
                contestId,
                submissionId: submission.id,
                points: 0, // Will be updated on AC
            },
        });

        // 9. TODO: Trigger Judge0 evaluation
        // This should be done via a background job or webhook
        // For now, return submission ID for client-side polling

        return {
            success: true,
            submissionId: submission.id,
        };

    } catch (error) {
        console.error('[CONTEST_SUBMISSION_ERROR]', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Submission failed',
        };
    }
}

/**
 * Get user's submission history for a contest problem
 */
export async function getContestProblemSubmissions(contestId: string, problemId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const submissions = await db.contestSubmission.findMany({
            where: {
                userId: session.user.id,
                contestId,
                problemId,
            },
            include: {
                submission: {
                    select: {
                        id: true,
                        status: true,
                        createdAt: true,
                        time: true,
                        memory: true,
                        language: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return {
            success: true,
            submissions,
        };
    } catch (error) {
        console.error('[GET_CONTEST_SUBMISSIONS_ERROR]', error);
        return {
            success: false,
            error: 'Failed to fetch submissions',
        };
    }
}
