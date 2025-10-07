// /apps/submission-webhook/src/index.ts

// Load environment variables from .env.local
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


// Define route handlers
app.put("/submission-callback", async (req: Request, res: Response): Promise<any> => {
    // Validate header secret
    const expectedHeaderSecret = process.env.JUDGE0_SECRET;
    if (expectedHeaderSecret) {
        const sentHeaderSecret = req.headers["x-judge0-secret"] as string | undefined;
        if (sentHeaderSecret !== expectedHeaderSecret) {
            return res.status(401).json({
                message: "Invalid header secret, Unauthorized access",
            });
        }
    }

    const parseBody = submissionCallback.safeParse(req.body);

    if (!parseBody.success) {
        return res.status(400).json({
            message: "Invalid request",
            errors: parseBody.error.errors
        });
    }

    try {
        // Convert memory to a number (or null if undefined/invalid)
        const memory = parseBody.data.memory ? parseInt(parseBody.data.memory) : null;
        const time = parseBody.data.time ? parseFloat(parseBody.data.time) : null;

        // Get the correct status from the mapping
        const status = outputMapping[parseBody.data.status.description] || TestCaseStatus.FAIL;

        const judge0TrackingId = parseBody.data.token;

        const initialTestCase = await db.testCase.findUnique({
            where: {
                judge0TrackingId
            },
            select: {
                submissionId: true
            }
        });

        if (!initialTestCase) {
            return res.status(404).json({
                message: "Test case not found"
            });
        }

        const submissionId = initialTestCase.submissionId;

        await db.$transaction(async (tx) => {
            // Lock parent submission row
            await tx.$executeRaw`SELECT id FROM "Submission" WHERE "id" = ${submissionId} FOR UPDATE`;

            await tx.testCase.update({
                where: {
                    judge0TrackingId
                },
                data: {
                    status: status,
                    time: time,
                    memory: memory
                }
            });


            // Rest of your code...
            const allTestsCases = await tx.testCase.findMany({
                where: {
                    submissionId
                }
            });

            const pendingTestsCases = allTestsCases.filter(tc => tc.status === TestCaseStatus.PENDING);
            if (pendingTestsCases.length > 0) {
                return;
            }

            const failedTestsCases = allTestsCases.filter(tc => tc.status !== TestCaseStatus.AC);
            const accepted = failedTestsCases.length === 0;

            // Calculate max time with null safety
            const testCaseTimes = allTestsCases
                .map(testcase => testcase.time || 0)
                .filter(time => typeof time === 'number');

            const maxTime = testCaseTimes.length > 0 ? Math.max(...testCaseTimes) : 0;

            const submission = await tx.submission.update({
                where: {
                    id: submissionId
                },
                data: {
                    status: accepted ? 'AC' : 'REJECTED',
                    time: maxTime
                },
                include: {
                    problem: true,
                    activeContest: true
                }
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
            }
        });
        return res.status(200).json({
            message: "Success",
        })
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
