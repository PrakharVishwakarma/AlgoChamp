// apps/web/app/api/submission/route.ts

import { NextRequest, NextResponse } from "next/server";

import { submissioninputValidation } from "@repo/zod-validation/submissioninputValidation";

import { db } from "@repo/db";

import { getProblems } from "../../lib/problem";

import axios from "axios";

import { LANGUAGE_MAPPING } from "@repo/common/language";

import { getServerSession } from "next-auth";

import { authOptions } from "../../lib/auth";

import { parse } from "url"


export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json(
            { message: "You must be logged in to create a submission" },
            { status: 401 }
        );
    }
    console.log("User is logged In with session:", session);
    // ✅ Rate limiting per user
    const SUBMISSIONS_PER_MINUTE = 5;
    const recentSubmissions = await db.submission.count({
        where: {
            userId: session.user.id,
            createdAt: {
                gte: new Date(Date.now() - 60000) // Last minute
            }
        }
    });

    if (recentSubmissions >= SUBMISSIONS_PER_MINUTE) {
        return NextResponse.json(
            {
                message: "Too many submissions. Please wait before submitting again.",
                retryAfter: 60
            },
            { status: 429 }
        );
    }

    const submissionInput = submissioninputValidation.safeParse(await req.json());

    if (!submissionInput.success) {
        return NextResponse.json(
            { message: submissionInput.error.errors },
            { status: 400 }
        );
    }

    const dbProblem = await db.problem.findFirst({
        where: {
            id: submissionInput.data.problemId
        }
    });

    if (!dbProblem) {
        return NextResponse.json(
            { message: "Problem not found" },
            { status: 400 }
        );
    }

    const problem = await getProblems(
        dbProblem.slug,
        submissionInput.data.languageId
    );
    console.log("Fetched problem for submission:", problem.id, "\n with the inputs : ", problem.inputs, "\n And outputs: ", problem.outputs, "\n And Full Boilerplate: ", problem.fullBoilerPlateCode);

    // ✅ Validate test cases configuration
    if (!problem.inputs || !problem.outputs || problem.inputs.length === 0) {
        return NextResponse.json(
            { message: "Problem has no test cases configured" },
            { status: 400 }
        );
    }

    if (problem.inputs.length !== problem.outputs.length) {
        return NextResponse.json(
            { message: "Problem configuration error: mismatched test cases" },
            { status: 500 }
        );
    }

    // ✅ Limit maximum test cases to prevent DoS
    const MAX_TEST_CASES = 50;
    if (problem.inputs.length > MAX_TEST_CASES) {
        return NextResponse.json(
            { message: `Problem has too many test cases (max: ${MAX_TEST_CASES})` },
            { status: 400 }
        );
    }

    // ✅ Sanitize user code to prevent injection
    const MAX_CODE_LENGTH = 50000; // 50KB limit
    if (submissionInput.data.code.length > MAX_CODE_LENGTH) {
        return NextResponse.json(
            { message: "Code too long. Maximum 50KB allowed." },
            { status: 400 }
        );
    }

    // ✅ Check for potentially dangerous patterns
    const DANGEROUS_PATTERNS = [
        /system\s*\(/i,
        /exec\s*\(/i,
        /eval\s*\(/i,
        /import\s+os/i,
        /import\s+subprocess/i,
        /__import__/i,
        /Runtime\.getRuntime/i,
        /ProcessBuilder/i
    ];

    const hasDangerousCode = DANGEROUS_PATTERNS.some(pattern =>
        pattern.test(submissionInput.data.code)
    );

    if (hasDangerousCode) {
        return NextResponse.json(
            { message: "Code contains potentially dangerous operations" },
            { status: 400 }
        );
    }

    problem.fullBoilerPlateCode = problem.fullBoilerPlateCode.replace(
        "##USER_CODE_HERE##",
        submissionInput.data.code
    );
    console.log("Final full boilerplate code for submission:", problem.fullBoilerPlateCode);

    // Validate language mapping exists
    const languageMapping = LANGUAGE_MAPPING[submissionInput.data.languageId];
    if (!languageMapping) {
        return NextResponse.json(
            { message: `Unsupported language: ${submissionInput.data.languageId}` },
            { status: 400 }
        );
    }

    const judge0Url = process.env.JUDGE0_URL;
    const rapidApiKey = process.env.JUDGE0_RAPIDAPI_KEY;
    const callbackUrl = process.env.JUDGE0_CALLBACK_URL;
    const judge0Secret = process.env.JUDGE0_SECRET;

    if (!judge0Url || !rapidApiKey || !callbackUrl || !judge0Secret) {
        console.error("❌ Judge0 environment variables are not fully configured.");
        return NextResponse.json(
            { message: "Code execution service is not configured." },
            { status: 500 } // Internal Server Error
        );
    }

    const headers = {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': new URL(judge0Url).hostname, // e.g., 'judge0-ce.p.rapidapi.com'
        'Content-Type': 'application/json'
    };

    // ✅ Add error handling for Judge0 API call
    let response;
    try {
        response = await axios.post(
            `${judge0Url}/submissions/batch?base64_encoded=false`, // Use RapidAPI URL
            {
                submissions: problem.inputs.map((input, index) => ({ // <-- FIXED!
                    language_id: languageMapping.judge0,
                    source_code: problem.fullBoilerPlateCode,
                    stdin: input,
                    expected_outcome: problem.outputs[index],
                    callback_url: `${callbackUrl}?secret=${judge0Secret}`,
                })),
            },
            { headers: headers }
        );
    } catch (error) {
        console.error("Judge0 API error:", error);

        // ✅ Provide specific error messages based on error type
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                return NextResponse.json(
                    {
                        message: "Code execution service is temporarily unavailable. Please try again later.",
                        error: "JUDGE0_UNAVAILABLE"
                    },
                    { status: 503 } // Service Unavailable
                );
            }

            if (error.response?.status === 429) {
                return NextResponse.json(
                    {
                        message: "Too many submissions. Please wait a moment before submitting again.",
                        error: "RATE_LIMITED"
                    },
                    { status: 429 } // Too Many Requests
                );
            }

            if (error.response && error.response.status >= 400 && error.response.status < 500) {
                return NextResponse.json(
                    {
                        message: "Invalid submission format. Please check your code and try again.",
                        error: "JUDGE0_CLIENT_ERROR"
                    },
                    { status: 400 }
                );
            }
        }

        // ✅ Generic fallback for other errors
        return NextResponse.json(
            {
                message: "Code execution service error. Please try again later.",
                error: "JUDGE0_ERROR"
            },
            { status: 500 }
        );
    }

    // ✅ Validate Judge0 response before proceeding
    if (!response.data || !Array.isArray(response.data) || response.data.length !== problem.inputs.length) {
        console.error("Invalid Judge0 response:", response.data);
        return NextResponse.json(
            {
                message: "Invalid response from code execution service. Please try again later.",
                error: "INVALID_JUDGE0_RESPONSE"
            },
            { status: 500 }
        );
    }

    // ✅ Check if all tokens are present
    const missingTokens = response.data.some(item => !item.token);
    if (missingTokens) {
        console.error("Missing tokens in Judge0 response:", response.data);
        return NextResponse.json(
            {
                message: "Incomplete response from code execution service. Please try again later.",
                error: "MISSING_JUDGE0_TOKENS"
            },
            { status: 500 }
        );
    }

    // ✅ Only create database records after successful Judge0 API call
    // ✅ Add structured logging
    const logSubmissionEvent = (event: string, data: Record<string, unknown>) => {
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            event,
            userId: session.user.id,
            problemId: submissionInput.data.problemId,
            ...data
        }));
    };

    logSubmissionEvent('submission_started', {
        languageId: submissionInput.data.languageId,
        codeLength: submissionInput.data.code.length,
        testCasesCount: problem.inputs.length
    });

    const submission = await db.submission.create({
        data: {
            userId: session.user.id,
            problemId: submissionInput.data.problemId,
            languageId: languageMapping.internal,
            code: submissionInput.data.code,
            fullCode: problem.fullBoilerPlateCode,
            status: "PENDING",
            activeContestId: submissionInput.data.activeContestId,
        }
    });

    await db.testCase.createMany({
        data: problem.inputs.map((_, index) => ({
            submissionId: submission.id,
            index,
            status: "PENDING",
            judge0TrackingId: response.data[index].token
        })),
    });

    logSubmissionEvent('submission_created', {
        submissionId: submission.id,
        judge0Tokens: response.data.map(item => item.token)
    });

    return NextResponse.json(
        {
            message: "Submission created successfully",
            submissionId: submission.id,
        },
        { status: 201 }
    );
}

/*
export async function GET(req: NextRequest) {
    try {
        // ✅ Authenticate user
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // ✅ Parse the request URL to extract query parameters
        const { query } = parse(req.url, true);
        const { problemId, contestId } = query;

        // ✅ Validate query parameters
        if (!problemId) {
            return NextResponse.json({ message: "Problem ID is required" }, { status: 400 });
        }

        // ✅ Fetch submissions based on the presence of a contest ID
        const submissions = await db.submission.findMany({
            where: {
                userId: session.user.id,
                problemId: problemId as string,
                ...(contestId && { activeContestId: contestId as string }) // Include contest filter if present
            },
            orderBy: { createdAt: "desc" }, // ✅ Show latest submissions first
            select: {
                id: true,
                code: true,
                languageId: true,
                status: true,
                createdAt: true,
                activeContestId: true
            }
        });

        // ✅ Return submissions (empty array if none found)
        return NextResponse.json({ submissions });

    } catch (error) {
        console.error("Error fetching submissions:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
*/

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        console.log("User is logged In with session:", session);

        const { query } = parse(req.url, true);
        console.log("Parsed query parameters:", query);
        const { submissionId, problemId, contestId } = query; 

        // --- Logic for fetching a SINGLE submission ---
        if (submissionId && typeof submissionId === 'string') {
            const submission = await db.submission.findUnique({
                where: {
                    id: submissionId,
                    // Optional: Ensure the user requesting owns the submission
                    userId: session.user.id
                },
                select: {
                    id: true,
                    status: true,
                    languageId: true,
                    createdAt: true,
                    time: true,
                    memory: true,
                    // Optionally include test case details if needed for display
                    // testCases: { orderBy: { index: 'asc' }, select: { status: true, index: true } }
                }
            });

            if (!submission) {
                return NextResponse.json({ message: "Submission not found" }, { status: 404 });
            }

            // console.log("Fetched submission:", submission);
            return NextResponse.json({ submission });
        }
        // --- End of single submission logic ---

        // --- Existing logic for fetching MULTIPLE submissions (for history) ---
        else if (problemId && typeof problemId === 'string') {
            const submissions = await db.submission.findMany({
                where: {
                    userId: session.user.id,
                    problemId: problemId,
                    ...(contestId && typeof contestId === 'string' && { activeContestId: contestId })
                },
                orderBy: { createdAt: "desc" },
                // Keep existing select or adjust as needed for the history list
                select: {
                    id: true,
                    code: true, // Maybe remove 'code' if not needed for list view
                    languageId: true,
                    status: true,
                    createdAt: true,
                    activeContestId: true,
                    time: true,
                    memory: true,
                }
            });
            // console.log("Fetched submissions:", submissions);
            return NextResponse.json({ submissions });
        }
        // --- End of multiple submission logic ---
        else {
            // If neither submissionId nor problemId is provided
            return NextResponse.json({ message: "Missing required query parameter: submissionId or problemId" }, { status: 400 });
        }

    } catch (error) {
        console.error("Error fetching submission(s):", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}