// /apps/submission-webhook/src/index.ts

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import express from "express";
import type { Request, Response } from "express";
import { db } from "@repo/db";
import { submissionCallback } from "@repo/zod-validation/submissionCallback";
import { TestCaseStatus, SubmissionStatus, Prisma } from "@prisma/client";
import { outputMapping } from "./outputMapping.js";
import { getPoints } from "./points.js";

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

function parseNumeric(val: string | number | null | undefined): number | null {
    if (val === null || val === undefined) return null;
    if (typeof val === 'number') return val;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
}

function mapJudge0Status(description: string): TestCaseStatus {
    return outputMapping[description] || TestCaseStatus.FAIL;
}

app.put("/submission-callback", async (req: Request, res: Response): Promise<any> => {
    const requestStartTime = Date.now();

    // Step 1: Authentication
    const expectedHeaderSecret = process.env.JUDGE0_SECRET;
    if (expectedHeaderSecret) {
        const sentQuerySecret = req.query.secret as string | undefined;
        if (sentQuerySecret !== expectedHeaderSecret) {
            console.warn(`⚠️ [AUTH_FAILED] Invalid secret`);
            return res.status(401).json({ message: "Unauthorized" });
        }
    }

    // Step 2: Validation
    const parseBody = submissionCallback.safeParse(req.body);
    if (!parseBody.success) {
        console.error("❌ [VALIDATION_FAILED]", parseBody.error.errors);
        return res.status(400).json({ message: "Invalid payload" });
    }
    console.log("✅ [VALIDATION_SUCCESS]", parseBody.data);

    const { token: judge0TrackingId, status: judge0Status, time, memory } = parseBody.data;
    const testCaseStatus = mapJudge0Status(judge0Status.description);
    const testCaseTime = parseNumeric(time);
    const testCaseMemory = parseNumeric(memory);

    console.log(`📥 [WEBHOOK] token=${judge0TrackingId}, status=${judge0Status.description}`);

    try {
        // Step 3: Find test case
        const testCase = await db.testCase.findUnique({
            where: { judge0TrackingId },
            select: { submissionId: true, status: true }
        });

        if (!testCase) {
            console.error(`❌ [NOT_FOUND] Test case: ${judge0TrackingId}`);
            return res.status(404).json({ message: "Test case not found" });
        }

        const submissionId = testCase.submissionId;
        console.log(`🔍 [FOUND] Test case for submission: ${submissionId}`);

        // Step 4: Idempotency check
        if (testCase.status !== TestCaseStatus.PENDING) {
            console.log(`✅ [IDEMPOTENT] Already processed (${testCase.status})`);
            return res.status(200).json({ message: "Already processed", submissionId });
        }

        console.log(`⏳ [PROCESSING] Updating test case having judge0TrackingId ${judge0TrackingId} -> ${testCaseStatus}, time: ${testCaseTime}, memory: ${testCaseMemory}`);
        // Step 5: Update test case in SHORT transaction
        const testCaseUpdated = await db.$transaction(async (tx) => {
            const updated = await tx.testCase.updateMany({
                where: { judge0TrackingId, status: TestCaseStatus.PENDING },
                data: { status: testCaseStatus, time: testCaseTime, memory: testCaseMemory }
            });
            return updated.count > 0;
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
            timeout: 5000
        });

        if (!testCaseUpdated) {
            console.log(`⏩ [SKIP] Already updated by another webhook`);
            return res.status(200).json({ message: "Already updated", submissionId });
        }

        console.log(`✅ [UPDATED] Test case ${judge0TrackingId} → ${testCaseStatus}`);

        // Step 6: Small delay to allow other transactions to commit
        // await new Promise(resolve => setTimeout(resolve, 50));

        // Step 7: Check if all done + try to claim
        const shouldFinalize = await db.$transaction(async (tx) => {
            const pendingCount = await tx.testCase.count({
                where: { submissionId, status: TestCaseStatus.PENDING }
            });

            console.log(`📊 [CHECK] Submission ${submissionId}: ${pendingCount} pending`);

            if (pendingCount > 0) {
                console.log(`⏳ [WAITING] ${pendingCount} test cases still pending`);
                return false;
            }

            // Try to claim
            const claimed = await tx.submission.updateMany({
                where: { id: submissionId, status: SubmissionStatus.PENDING },
                data: { status: SubmissionStatus.AC }
            });

            if (claimed.count === 0) {
                console.log(`⏩ [SKIP] Already claimed by another webhook`);
                return false;
            }

            console.log(`🔒 [CLAIMED] Will finalize submission`);
            return true;
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
            timeout: 5000
        });

        if (!shouldFinalize) {
            const duration = Date.now() - requestStartTime;
            console.log(`✅ [COMPLETE] Not finalizing (${duration}ms)`);
            return res.status(200).json({ message: "Test case updated", submissionId });
        }

        // Step 8: Finalize submission
        await db.$transaction(async (tx) => {
            const allTestCases = await tx.testCase.findMany({
                where: { submissionId },
                select: { status: true, time: true, memory: true }
            });

            const passedCount = allTestCases.filter(tc => tc.status === TestCaseStatus.AC).length;
            const failedCount = allTestCases.length - passedCount;
            const finalStatus = failedCount === 0 ? SubmissionStatus.AC : SubmissionStatus.REJECTED;

            const times = allTestCases.map(tc => tc.time).filter((t): t is number => t !== null);
            const memories = allTestCases.map(tc => tc.memory).filter((m): m is number => m !== null);
            const maxTime = times.length > 0 ? Math.max(...times) : null;
            const maxMemory = memories.length > 0 ? Math.max(...memories) : null;

            const submission = await tx.submission.update({
                where: { id: submissionId },
                data: { status: finalStatus, time: maxTime, memory: maxMemory },
                include: { problem: true, activeContest: true }
            });

            console.log(`🎯 [FINALIZED] Status=${finalStatus}, passed=${passedCount}/${allTestCases.length}`);

            // Update problem stats
            if (finalStatus === SubmissionStatus.AC) {
                const existingAC = await tx.submission.findFirst({
                    where: {
                        userId: submission.userId,
                        problemId: submission.problemId,
                        status: SubmissionStatus.AC,
                        id: { not: submissionId }
                    }
                });

                if (!existingAC) {
                    await tx.problem.update({
                        where: { id: submission.problemId },
                        data: { solved: { increment: 1 } }
                    });
                    console.log(`🎉 [FIRST_SOLVE] User solved problem`);
                }
            }

            await tx.problem.update({
                where: { id: submission.problemId },
                data: { totalSubmissions: { increment: 1 } }
            });

            // Contest submissions
            if (submission.activeContestId && submission.activeContest) {
                const points = await getPoints(
                    submission.activeContestId,
                    submission.userId,
                    submission.problemId,
                    submission.problem.difficulty,
                    submission.activeContest.startTime,
                    submission.activeContest.endTime
                );

                await tx.contestSubmission.upsert({
                    where: {
                        userId_problemId_contestId: {
                            contestId: submission.activeContestId,
                            userId: submission.userId,
                            problemId: submission.problemId
                        }
                    },
                    create: {
                        submissionId: submission.id,
                        userId: submission.userId,
                        problemId: submission.problemId,
                        contestId: submission.activeContestId,
                        points
                    },
                    update: { points }
                });

                console.log(`📊 [CONTEST] Points=${points}`);
            }
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
            timeout: 10000
        });

        const duration = Date.now() - requestStartTime;
        console.log(`✅ [SUCCESS] Finalized in ${duration}ms`);

        return res.status(200).json({ message: "Submission finalized", submissionId });

    } catch (error) {
        const duration = Date.now() - requestStartTime;
        console.error(`❌ [ERROR] Failed (${duration}ms):`, error);

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
            return res.status(503).json({ message: "Deadlock, retrying..." });
        }

        return res.status(500).json({ message: "Internal error" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Webhook server on port ${PORT}`);
});

/*
// /apps/submission-webhook/src/index.ts

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import express from "express";
import type { Request, Response } from "express";
import { db } from "@repo/db";
import { submissionCallback } from "@repo/zod-validation/submissionCallback";
import { TestCaseStatus } from "@prisma/client";
import { outputMapping } from "./outputMapping.js";
import { getPoints } from "./points.js";

// Create Express application instance
const app = express();

// Configure middleware
app.use(express.json());


function parseNumeric(val: string | number | null | undefined): number | null {
    if (val === null || val === undefined) return null;
    if (typeof val === 'number') return val; // It's already a number
    
    // It's a string, try to parse it
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
}

// Define route handlers
app.put("/submission-callback", async (req: Request, res: Response): Promise<any> => {
    // Validate header secret
    const expectedHeaderSecret = process.env.JUDGE0_SECRET;
    if (expectedHeaderSecret) {
        console.log("Validating header secret");
        console.log("Expected Secret:", expectedHeaderSecret);
        const sentQuerySecret = req.query.secret as string | undefined;
        console.log("Sent Query Secret:", sentQuerySecret);
        if (sentQuerySecret !== expectedHeaderSecret) {
            return res.status(401).json({
                message: "Invalid header secret, Unauthorized access",
            });
        }
        console.log("Header secret validated successfully");
    }

    const parseBody = submissionCallback.safeParse(req.body);

    if (!parseBody.success) {
        console.log("Parsed webhook body unsuccessfully with the error :", JSON.stringify(parseBody.error.errors, null, 2));
        return res.status(400).json({
            message: "Invalid request",
            errors: parseBody.error.errors
        });
    }
    console.log("Parsed webhook body successfully\n", parseBody.data);

    try {
        // Convert memory to a number (or null if undefined/invalid)
        const memory = parseNumeric(parseBody.data.memory);
        const time = parseNumeric(parseBody.data.time);

        // Get the correct status from the mapping
        const status = outputMapping[parseBody.data.status.description] || TestCaseStatus.FAIL;

        const judge0TrackingId = parseBody.data.token;

        console.log(`📥 Processing webhook for token: ${judge0TrackingId}`, {
            status: parseBody.data.status.description,
            time,
            memory,
            timestamp: new Date().toISOString()
        });

        const testCase = await db.testCase.findUnique({
            where: {
                judge0TrackingId
            },
            select: {
                submissionId: true
            }
        });

        console.log("\n Fetched test case having tracking ID:", judge0TrackingId, testCase);
        if (!testCase) {
            return res.status(404).json({
                message: "Test case not found"
            });
        }

        const submissionId = testCase.submissionId;

        await db.$transaction(async (tx) => {
        // ✅ Lock submission row first for better race condition handling
        const lockedSubmission = await tx.submission.findUnique({
            where: { id: submissionId },
            include: { 
                problem: true,
                activeContest: true
            }
        });

        if (!lockedSubmission) {
            throw new Error(`Submission not found: ${submissionId}`);
        }

        // Get the status of the test case we are about to update
        const currentTestCase = await tx.testCase.findUnique({
            where: { judge0TrackingId },
            select: { status: true }
        });

        // If this test case is *already* processed, or the *entire submission* is finished,
        // we can stop here to prevent re-processing.
        const finalStates: TestCaseStatus[] = [TestCaseStatus.AC, TestCaseStatus.FAIL, TestCaseStatus.TLE];
        if (
            (currentTestCase && finalStates.includes(currentTestCase.status)) ||
            (finalStates.includes(lockedSubmission.status as TestCaseStatus)) // Cast as it includes SubmissionStatus
        ) {
            console.log(`⏩ Submission ${submissionId} or test case ${judge0TrackingId} already finalized. Skipping duplicate update.`);
            return; // Stop processing
        }
        // --- END: New Optimization Guard Clause ---

        // Update test case
        console.log(`Updating test case having ${judge0TrackingId} updated with status: ${status}, time: ${time}, memory: ${memory}`);
        const updatedTestCase = await tx.testCase.update({
            where: {
                judge0TrackingId
            },
            data: {
                status: status,
                time: time,
                memory: memory
            }
        });

        console.log("Updated test case:", updatedTestCase.judge0TrackingId, " with ", {
            status: updatedTestCase.status,
            time: updatedTestCase.time,
            memory: updatedTestCase.memory
        });

        // ✅ Optimized test case aggregation using fresh data
        const allTestsCases = await tx.testCase.findMany({
            where: {
                submissionId
            },
            select: {
                status: true,
                time: true,
                memory: true
            }
        });

        const pendingTestsCases = allTestsCases.filter(tc => tc.status === TestCaseStatus.PENDING);
        if (pendingTestsCases.length > 0) {
            console.log(`⏳ Submission ${submissionId} still has ${pendingTestsCases.length} pending test cases`);
            return; // Still waiting for other test cases
        }

        console.log("Seems like All the test cases are processed for submission:", submissionId);
        const failedTestsCases = allTestsCases.filter(tc => tc.status !== TestCaseStatus.AC);
        const accepted = failedTestsCases.length === 0;
        console.log(`Submission ${submissionId} acceptance status: ${accepted ? 'ACCEPTED' : 'REJECTED'}`);
        // ✅ Calculate max time and memory with null safety
        const testCaseTimes = allTestsCases
            .map(testcase => testcase.time || 0)
            .filter(time => typeof time === 'number');

        const testCaseMemories = allTestsCases
            .map(testcase => testcase.memory || 0)
            .filter(memory => typeof memory === 'number');

        const maxTime = testCaseTimes.length > 0 ? Math.max(...testCaseTimes) : 0;
        const maxMemory = testCaseMemories.length > 0 ? Math.max(...testCaseMemories) : 0;

        // Update submission status
        const submission = await tx.submission.update({
            where: {
                id: submissionId
            },
            data: {
                status: accepted ? 'AC' : 'REJECTED',
                time: maxTime,
                memory: maxMemory
            },
            include: {
                problem: true,
                activeContest: true
            }
        });

        console.log(`✅ Submission ${submissionId} completed with status: ${submission.status}`, {
            maxTime,
            maxMemory,
            totalTestCases: allTestsCases.length,
            failedCount: failedTestsCases.length
        });

        // ✅ Update problem statistics
        if (accepted) {
            // Check if this is the user's first AC for this problem
            const existingAC = await tx.submission.findFirst({
                where: {
                    userId: submission.userId,
                    problemId: submission.problemId,
                    status: 'AC',
                    id: { not: submissionId } // Exclude current submission
                }
            });

            if (!existingAC) {
                await tx.problem.update({
                    where: { id: submission.problemId },
                    data: { solved: { increment: 1 } }
                });
                console.log(`🎉 User ${submission.userId} solved problem ${submission.problemId} for the first time`);
            }
        }

        // Always increment total submissions for the problem
        await tx.problem.update({
            where: { id: submission.problemId },
            data: { totalSubmissions: { increment: 1 } }
        });

        if (submission.activeContestId && submission.activeContest) {
            const points = await getPoints(
                submission.activeContestId,
                submission.userId,
                submission.problemId,
                submission.problem.difficulty,
                submission.activeContest?.startTime,
                submission.activeContest?.endTime
            );

            await tx.contestSubmission.upsert({
                where: {
                    userId_problemId_contestId: {
                        contestId: submission.activeContestId,
                        userId: submission.userId,
                        problemId: submission.problemId
                    },
                },
                create: {
                    submissionId: submission.id,
                    userId: submission.userId,
                    problemId: submission.problemId,
                    contestId: submission.activeContestId,
                    points: points
                },
                update: {
                    points: points
                }
            });

            console.log(`📊 Updated contest submission for contest ${submission.activeContestId}, points: ${points}`);
        }
    }, {
        maxWait: 10000, // 10 seconds
        timeout: 30000  // 30 seconds
    });

    return res.status(200).json({
        message: "Success",
        submissionId: submissionId,
        timestamp: new Date().toISOString()
    });
    } catch (error) {
        console.error("Error processing submission callback:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

// Start the server if this is the main module
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Submission-Webhook server listening on port ${PORT}`);
});
*/


