// apps/web/app/problems/[slug]/actions.ts

"use server";

import { z } from "zod";
import axios from "axios";
import { getProblems } from "@/app/lib/problem";
import { LANGUAGE_MAPPING } from "@repo/common/language";
import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth";
import { Submission, Language } from "@prisma/client";
import { db } from "@repo/db";
import { unstable_cache } from 'next/cache';

// ✅ OPTIMIZATION: Enhanced validation with size limits
const runCodeSchema = z.object({
    problemSlug: z.string().min(1, "Problem slug is required"),
    userCode: z.string().min(1, "Code cannot be empty").max(100000, "Code is too large (max 100KB)"),
    languageId: z.enum(["js", "cpp", "rs"]),
});

// Define the expected shape of the results we'll return
export interface RunResult {
    input: string;
    expectedOutput: string | null;
    actualOutput: string | null;
    status: 'Passed' | 'Failed' | 'Error';
    errorMessage?: string;
    judge0StatusDescription?: string;
    time?: number | null;
    memory?: number | null;
}

// ✅ OPTIMIZATION #7: Smart output comparison with whitespace normalization
function compareOutputs(actual: string | null, expected: string | null): boolean {
    if (actual === null && expected === null) return true;
    if (actual === null || expected === null) return false;

    // Normalize whitespace: trim, collapse multiple spaces/newlines, lowercase for comparison
    const normalize = (s: string) =>
        s.trim()
            .split(/\s+/)
            .join(' ')
            .toLowerCase();

    return normalize(actual) === normalize(expected);
}

// ✅ OPTIMIZATION #5: Cache problem data to reduce DB/filesystem queries
const getCachedProblemData = unstable_cache(
    async (problemSlug: string, languageId: "js" | "cpp" | "rs") => {
        return await getProblems(problemSlug, languageId);
    },
    ['problem-boilerplate-data'],
    {
        revalidate: 3600, // Cache for 1 hour
        tags: [`problem-boilerplate`],
    }
);

/**
 * Executes user code against public test cases using Judge0 with parallel execution.
 * ✅ OPTIMIZATIONS:
 * - Parallel test case execution (3x faster)
 * - Smart output comparison (fewer false failures)
 * - Comprehensive error handling
 * - Input/output validation
 * - Caching for problem data
 * - Detailed logging for debugging
 */
export async function runCode(
    input: z.infer<typeof runCodeSchema>
): Promise<{ success: boolean; results?: RunResult[]; error?: string }> {

    const startTime = Date.now(); // ✅ Track execution time

    // 1. Authentication (optional for Run, required for Submit)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'anonymous';

    // 2. Validate Input
    console.log("Parsing code with input:", input);
    const validatedInput = runCodeSchema.safeParse(input);
    if (!validatedInput.success) {
        const errorMessages = validatedInput.error.errors.map(e => e.message).join(', ');
        console.error("❌ [RUN_CODE] Invalid input:", errorMessages);
        return { success: false, error: errorMessages };
    }
    const { problemSlug, userCode, languageId } = validatedInput.data;
    console.log(`🚀 Running code for problem's input : ${validatedInput.data}`);

    // ✅ OPTIMIZATION #9: Detailed logging for observability
    console.log('🚀 [RUN_CODE_START]', {
        userId,
        problemSlug,
        languageId,
        codeLength: userCode.length,
        timestamp: new Date().toISOString(),
    });

    try {
        // 3. Fetch Problem Details (Boilerplate, Public Inputs/Outputs)
        const languageMapping = LANGUAGE_MAPPING[languageId];
        if (!languageMapping) {
            return { success: false, error: `Unsupported language: ${languageId}` };
        }

        // ✅ OPTIMIZATION #5: Use cached problem data
        const problemData = await getCachedProblemData(problemSlug, languageId);

        // Assuming first 3 are public examples (keeping as requested)
        const publicInputs = problemData.inputs.slice(0, 3);
        const publicOutputs = problemData.outputs.slice(0, 3);

        if (publicInputs.length === 0) {
            console.warn(`⚠️ No public test cases found for problem: ${problemSlug}`);
            return { success: false, error: "No public test cases found for this problem." };
        }

        // Build full code
        const fullCode = problemData.fullBoilerPlateCode.replace("##USER_CODE_HERE##", userCode);

        // ✅ OPTIMIZATION #6: Validate final code size
        if (fullCode.length > 500000) {
            return { success: false, error: "Combined code is too large (max 500KB)" };
        }

        // ✅ OPTIMIZATION #6: Validate total input size
        const totalInputSize = publicInputs.reduce((sum, input) => sum + input.length, 0);
        if (totalInputSize > 10000000) {
            return { success: false, error: "Test case inputs are too large" };
        }

        // 4. ✅ OPTIMIZATION #1: Execute test cases in PARALLEL (3x faster!)
        const judge0Url = process.env.JUDGE0_URL;
        const rapidApiKey = process.env.JUDGE0_RAPIDAPI_KEY;
        console.log(`🚀 Judge0 URL: ${judge0Url}`);
        console.log(`🚀 RapidAPI Key: ${rapidApiKey}`);

        if (!judge0Url || !rapidApiKey) {
            console.error("❌ JUDGE0_URL or JUDGE0_RAPIDAPI_KEY environment variable is not set.");
            return { success: false, error: "Code execution service is not configured." };
        }

        console.log(`🚀 Executing ${publicInputs.length} test cases in parallel... ${typeof (publicInputs)} \n${publicInputs}`);
        console.log(`🚀 The Outputs will be compared against: ${typeof (publicOutputs)} \n${publicOutputs}`);

        const headers = {
            'x-rapidapi-key': rapidApiKey,
            'x-rapidapi-host': new URL(judge0Url).hostname,
            'Content-Type': 'application/json'
        };

        console.log(`🚀 Headers:`, headers);

        // ✅ CRITICAL FIX #1: Parallel execution instead of sequential
        const judgePromises = publicInputs.map(async (inputCase, index) => {
            const expectedOutputCase = publicOutputs[index]?.trim() || null;

            try {
                const response = await axios.post(
                    `${judge0Url}/submissions?base64_encoded=false&wait=true`,
                    {
                        language_id: languageMapping.judge0,
                        source_code: fullCode,
                        stdin: inputCase,
                        expected_output: expectedOutputCase,
                        cpu_time_limit: 2, // 2 seconds max
                        memory_limit: 128000, // 128MB
                    },
                    {
                        headers: headers,
                        timeout: 12000, // 12 second timeout (2s execution + 10s buffer)
                    }
                );

                return {
                    index,
                    inputCase,
                    expectedOutputCase,
                    judgeResult: response.data,
                    error: null,
                };
            } catch (error) {
                // ✅ CRITICAL FIX #3: Comprehensive error handling
                console.error(`❌ Judge0 error for test case ${index}:`, error);
                const errorDetail = axios.isAxiosError(error)
                    ? error.response?.data?.error || error.message || 'API request failed'
                    : error instanceof Error
                        ? error.message
                        : 'Unknown error';

                return {
                    index,
                    inputCase,
                    expectedOutputCase,
                    judgeResult: null,
                    error: errorDetail,
                };
            }
        });

        // Wait for all test cases to complete
        const judgeResults = await Promise.allSettled(judgePromises);

        // 5. Process results
        const results: RunResult[] = judgeResults.map((promiseResult, index) => {
            const inputCase = publicInputs[index] || "";
            const expectedOutputCase = publicOutputs[index]?.trim() || null;

            if (promiseResult.status === 'rejected') {
                return {
                    input: inputCase,
                    expectedOutput: expectedOutputCase,
                    actualOutput: null,
                    status: 'Error' as const,
                    errorMessage: `Execution failed: ${promiseResult.reason}`,
                    judge0StatusDescription: 'System Error',
                };
            }

            const { judgeResult, error: apiError } = promiseResult.value;

            if (apiError || !judgeResult) {
                return {
                    input: inputCase,
                    expectedOutput: expectedOutputCase,
                    actualOutput: null,
                    status: 'Error' as const,
                    errorMessage: `API Error: ${apiError || 'Unknown error'}`,
                    judge0StatusDescription: 'API Error',
                };
            }

            // Extract Judge0 response data
            const actualOutput = judgeResult.stdout?.trim() || null;
            const statusDescription = judgeResult.status?.description || "Unknown";
            const compileError = judgeResult.compile_output || null;
            const runtimeError = judgeResult.stderr || null;

            let runStatus: RunResult['status'] = 'Failed';

            // Determine status
            if (compileError) {
                runStatus = 'Error';
            } else if (statusDescription.includes("Time Limit Exceeded")) {
                runStatus = 'Error';
            } else if (runtimeError || statusDescription.includes("Runtime Error")) {
                runStatus = 'Error';
            } else if (statusDescription === "Accepted") {
                // ✅ OPTIMIZATION #7: Smart comparison with whitespace normalization
                runStatus = compareOutputs(actualOutput, expectedOutputCase) ? 'Passed' : 'Failed';
            } else {
                // Other Judge0 errors (Memory Limit, Internal Error, etc.)
                runStatus = 'Error';
            }

            return {
                input: inputCase,
                expectedOutput: expectedOutputCase,
                actualOutput: actualOutput,
                status: runStatus,
                errorMessage: compileError || runtimeError || (runStatus === 'Error' ? statusDescription : undefined),
                judge0StatusDescription: statusDescription,
                time: judgeResult.time ? parseFloat(judgeResult.time) : null,
                memory: judgeResult.memory ? parseInt(judgeResult.memory) : null,
            };
        });

        // ✅ OPTIMIZATION #9: Log results with metrics
        const duration = Date.now() - startTime;
        const passedCount = results.filter(r => r.status === 'Passed').length;

        console.log('✅ [RUN_CODE_COMPLETE]', {
            userId,
            problemSlug,
            success: true,
            passedCount,
            totalCount: results.length,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
        });

        return { success: true, results };
        
    } catch (error: unknown) {
        // ✅ OPTIMIZATION #9: Enhanced error logging
        const duration = Date.now() - startTime;
        console.error('❌ [RUN_CODE_ERROR]', {
            userId,
            problemSlug,
            error: error instanceof Error ? error.message : 'Unknown error',
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
        });

        return {
            success: false,
            error: "An unexpected error occurred. Please try again."
        };
    }
}


const getSubmissionsSchema = z.object({
    problemId: z.string(),
    page: z.number().min(1).default(1),
    pageSize: z.number().min(1).max(100).default(20), // Fetch 20 submissions per page
    status: z.enum(['PENDING', 'COMPILATION_ERROR', 'REJECTED', 'AC', 'TLE']).optional(), // Add status filter
});

export type SubmissionHistoryItem = Pick<
    Submission,
    'id' | 'status' | 'languageId' | 'createdAt' | 'time' | 'memory'
> & { language: Pick<Language, 'name'> };

export async function getSubmissions(
    input: z.infer<typeof getSubmissionsSchema>
): Promise<{ success: boolean; submissions?: SubmissionHistoryItem[]; error?: string; hasMore?: boolean }> {

    // 1. Validate Input
    const validatedInput = getSubmissionsSchema.safeParse(input);
    if (!validatedInput.success) {
        console.error("Invalid input to getSubmissions:", validatedInput.error);
        return { success: false, error: "Invalid input" };
    }
    const { problemId, page, pageSize, status } = validatedInput.data;

    // 2. Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }
    const userId = session.user.id;

    try {
        const skip = (page - 1) * pageSize;

        // 3. Fetch Submissions from DB with optional status filter
        const submissions = await db.submission.findMany({
            where: {
                userId: userId,
                problemId: problemId,
                ...(status && { status }), // Add status filter if provided
            },
            orderBy: { createdAt: 'desc' },
            take: pageSize + 1, // Fetch one extra to check if there are more pages
            skip: skip,
            select: {
                id: true,
                status: true,
                languageId: true,
                createdAt: true,
                time: true,
                memory: true,
                // Include the language name for display
                language: {
                    select: { name: true }
                }
            },
        });

        // 4. Determine if more submissions exist
        const hasMore = submissions.length > pageSize;
        const resultSubmissions = submissions.slice(0, pageSize); // Return only the requested page size

        return { success: true, submissions: resultSubmissions, hasMore };

    } catch (error: unknown) {
        console.error("Error fetching submissions:", error);
        return { success: false, error: "Failed to fetch submissions." };
    }
}

// Schema for getSubmissionCode input validation
const submissionCodeSchema = z.object({
    submissionId: z.string().min(1, "Submission ID is required"),
});

/**
 * Server action to retrieve the code for a specific submission
 * Validates user ownership before returning code
 */
export async function getSubmissionCode(submissionId: string): Promise<{
    success: boolean;
    code?: string;
    language?: string;
    error?: string;
}> {
    try {
        // 1. Input validation
        const validation = submissionCodeSchema.safeParse({ submissionId });
        if (!validation.success) {
            return { success: false, error: "Invalid submission ID." };
        }

        // 2. Authentication check
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { success: false, error: "You must be logged in." };
        }

        // 3. Fetch submission with user ownership validation
        const submission = await db.submission.findUnique({
            where: {
                id: submissionId,
            },
            select: {
                code: true,
                language: {
                    select: {
                        name: true,
                    },
                },
                userId: true,
            },
        });

        // 4. Validate submission exists and belongs to user
        if (!submission) {
            return { success: false, error: "Submission not found." };
        }

        if (submission.userId !== session.user.email) {
            return { success: false, error: "Unauthorized access to submission." };
        }

        // 5. Return submission code and language
        return {
            success: true,
            code: submission.code,
            language: submission.language.name,
        };

    } catch (error: unknown) {
        console.error("Error fetching submission code:", error);
        return { success: false, error: "Failed to fetch submission code." };
    }
}