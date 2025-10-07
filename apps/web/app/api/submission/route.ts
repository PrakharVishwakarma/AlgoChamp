// apps/web/app/api/submission/route.ts

import { NextRequest, NextResponse } from "next/server";

import { submissioninputValidation } from "@repo/zod-validation/submissioninputValidation";

import { db } from "@repo/db";

import { getProblems } from "../../lib/problem";

// this is remined to code for now
// import { JUDGE0_URL } from "../../../lib/config";

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

    problem.fullBoilerPlateCode = problem.fullBoilerPlateCode.replace(
        "##USER_CODE_HERE##",
        submissionInput.data.code
    );

    // Validate language mapping exists
    const languageMapping = LANGUAGE_MAPPING[submissionInput.data.languageId];
    if (!languageMapping) {
        return NextResponse.json(
            { message: `Unsupported language: ${submissionInput.data.languageId}` },
            { status: 400 }
        );
    }

    const response = await axios.post(
        `${process.env.JUDGE0_URL}/api/submission/batch?base64_encoded=false`, {
        submission: problem.inputs.map((input, index) => ({
            language_id: languageMapping.judge0,
            source_code: problem.fullBoilerPlateCode,
            stdin: input,
            expected_outcome: problem.outputs[index],
            callback_url: process.env.JUDGE0_CALLBACK_URL ?? "http://localhost:3000/api/submission/callback",
        })),
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
    })

    await db.testCase.createMany({
        data: problem.inputs.map((_, index) => ({
            submissionId: submission.id,
            index,
            status: "PENDING",
            judge0TrackingId: response.data[index].token
        })),
    })

    return NextResponse.json(
        {
            message: "Submission created successfully",
            submissionId: submission.id,
        },
        { status: 201 }
    );
}


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