// apps/web/app/admin/actions/problemActions.ts
// EXAMPLE: How to use revalidation in admin actions

"use server";

import { db } from "@repo/db";
import { revalidateProblem, revalidateProblemWithList, revalidateProblemsListPage } from "@/lib/revalidation";

/**
 * EXAMPLE 1: Update an existing problem
 * Revalidates only the specific problem page
 */
export async function updateProblemAction(problemId: string, data: any) {
    try {
        const updatedProblem = await db.problem.update({
            where: { id: problemId },
            data: {
                title: data.title,
                description: data.description,
                difficulty: data.difficulty,
                // ... other fields
            },
        });

        // ✅ CRITICAL: Revalidate the problem page cache immediately
        revalidateProblem(updatedProblem.slug);

        return { 
            success: true, 
            problem: updatedProblem,
            message: `Problem updated and cache refreshed for ${updatedProblem.slug}`
        };
    } catch (error) {
        console.error("Failed to update problem:", error);
        return { 
            success: false, 
            error: (error as Error).message 
        };
    }
}

/**
 * EXAMPLE 2: Create a new problem
 * Revalidates both the new problem page AND the problems list
 */
export async function createProblemAction(data: any) {
    try {
        const newProblem = await db.problem.create({
            data: {
                title: data.title,
                slug: data.slug,
                description: data.description,
                difficulty: data.difficulty,
                hidden: data.hidden || false,
                // ... other fields
            },
        });

        // ✅ CRITICAL: Revalidate new problem page + problems list
        revalidateProblemWithList(newProblem.slug);

        return { 
            success: true, 
            problem: newProblem,
            message: `Problem created and caches refreshed`
        };
    } catch (error) {
        console.error("Failed to create problem:", error);
        return { 
            success: false, 
            error: (error as Error).message 
        };
    }
}

/**
 * EXAMPLE 3: Delete a problem
 * Revalidates the problems list page
 */
export async function deleteProblemAction(problemId: string) {
    try {
        const deletedProblem = await db.problem.delete({
            where: { id: problemId },
        });

        // ✅ CRITICAL: Revalidate problems list to remove deleted problem
        revalidateProblemsListPage();

        return { 
            success: true,
            message: `Problem deleted and list cache refreshed`
        };
    } catch (error) {
        console.error("Failed to delete problem:", error);
        return { 
            success: false, 
            error: (error as Error).message 
        };
    }
}

/**
 * EXAMPLE 4: Toggle problem visibility
 * Revalidates both problem page and list
 */
export async function toggleProblemVisibilityAction(problemId: string, hidden: boolean) {
    try {
        const updatedProblem = await db.problem.update({
            where: { id: problemId },
            data: { hidden },
        });

        // ✅ CRITICAL: Revalidate both pages when visibility changes
        revalidateProblemWithList(updatedProblem.slug);

        return { 
            success: true,
            problem: updatedProblem,
            message: `Problem visibility updated and caches refreshed`
        };
    } catch (error) {
        console.error("Failed to toggle visibility:", error);
        return { 
            success: false, 
            error: (error as Error).message 
        };
    }
}

/**
 * EXAMPLE 5: Update problem boilerplates
 * Revalidates only the problem page
 */
export async function updateBoilerplatesAction(problemId: string, boilerplates: any) {
    try {
        // Update defaultCode entries
        await db.$transaction([
            // Delete existing boilerplates
            db.defaultCode.deleteMany({
                where: { problemId },
            }),
            // Create new boilerplates
            ...Object.entries(boilerplates).map(([languageId, code]) =>
                db.defaultCode.create({
                    data: {
                        problemId,
                        languageId,
                        code: code as string,
                    },
                })
            ),
        ]);

        const problem = await db.problem.findUnique({
            where: { id: problemId },
            select: { slug: true },
        });

        if (problem) {
            // ✅ CRITICAL: Revalidate problem page with updated boilerplates
            revalidateProblem(problem.slug);
        }

        return { 
            success: true,
            message: `Boilerplates updated and cache refreshed`
        };
    } catch (error) {
        console.error("Failed to update boilerplates:", error);
        return { 
            success: false, 
            error: (error as Error).message 
        };
    }
}

/**
 * BEST PRACTICES:
 * 
 * 1. Always call revalidation AFTER successful database updates
 * 2. Use revalidateProblem() for single problem updates
 * 3. Use revalidateProblemWithList() for new problems or visibility changes
 * 4. Use revalidateProblemsListPage() for deletions or bulk operations
 * 5. Revalidation is synchronous and fast (<5ms), safe to call inline
 * 6. Failed revalidations are logged but don't break the operation
 * 7. Users get stale data for max 1 hour (revalidate = 3600), but admin
 *    updates are reflected immediately via manual revalidation
 */
