// Ensure correct imports for Express
import express from "express";
import type { Request, Response } from "express";
import { db } from "@repo/db";
import { submissionCallback } from "@repo/zod-validation/src/SubmissionCallback";
import { TestCaseStatus } from "@prisma/client";
import { outputMapping } from "./outputMapping";
import { getPoints } from "./points";

// Create Express application instance
const app = express();

// Configure middleware
app.use(express.json());

// Define route handlers
app.put("/submission-callback", async (req: Request, res: Response): Promise<any> => {
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

        const testCase = await db.testCase.update({
            where: {
                judge0TrackingId: parseBody.data.token
            },
            data: {
                status: status,
                time: time,
                memory: memory
            }
        });

        if (!testCase) {
            return res.status(404).json({
                message: "Test case not found"
            });
        }

        // Rest of your code...
        const allTestscaseData = await db.testCase.findMany({
            where: {
                submissionId: testCase.submissionId
            }
        });

        const pendingTestscases = allTestscaseData.filter(tc => tc.status === TestCaseStatus.PENDING);
        const failedTestscases = allTestscaseData.filter(tc => tc.status !== TestCaseStatus.AC);

        if (pendingTestscases.length === 0) {
            const accepted = failedTestscases.length === 0;

            // Calculate max time with null safety
            const testCaseTimes = allTestscaseData
                .map(testcase => testcase.time || 0)
                .filter(time => typeof time === 'number');

            const maxTime = testCaseTimes.length > 0 ? Math.max(...testCaseTimes) : 0;

            const response = await db.submission.update({
                where: {
                    id: testCase.submissionId
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

            if (response.activeContestId && response.activeContest) {
                const points = await getPoints(
                    response.activeContestId,
                    response.userId,
                    response.problemId,
                    response.problem.difficulty,
                    response.activeContest?.startTime,
                    response.activeContest?.endTime
                );

                await db.contestSubmission.upsert({
                    where: {
                        userId_problemId_contestId: {
                            contestId: response.activeContestId,
                            userId: response.userId,
                            problemId: response.problemId
                        },
                    },
                    create: {
                        submisionId: response.id,
                        userId: response.userId,
                        problemId: response.problemId,
                        contestId: response.activeContestId,
                        points: points
                    },
                    update: {
                        points: points
                    }
                });
            }
        }

    return res.status(200).json({
        message : "Success",
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Webhook server listening on port ${PORT}`);
});
