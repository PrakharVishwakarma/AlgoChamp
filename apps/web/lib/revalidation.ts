// apps/web/lib/revalidation.ts

/**
 * Revalidation Utilities
 * 
 * Helper functions to trigger on-demand cache revalidation
 * when admins update problems or other content.
 */

import { revalidatePath } from 'next/cache';

/**
 * Revalidate a specific problem page cache
 * Call this when admin updates a problem
 * 
 * @param slug - The problem slug (e.g., 'two-sum')
 */
export function revalidateProblem(slug: string): void {
    try {
        const problemPath = `/problems/${slug}`;
        revalidatePath(problemPath);
        console.log(`✅ Cache revalidated for problem: ${slug}`);
    } catch (error) {
        console.error(`❌ Failed to revalidate problem ${slug}:`, error);
    }
}

/**
 * Revalidate the problems list page cache
 * Call this when admin creates/deletes problems or updates visibility
 */
export function revalidateProblemsListPage(): void {
    try {
        revalidatePath('/problems');
        console.log(`✅ Cache revalidated for problems list`);
    } catch (error) {
        console.error(`❌ Failed to revalidate problems list:`, error);
    }
}

/**
 * Revalidate multiple paths at once
 * Useful when an update affects multiple pages
 * 
 * @param paths - Array of paths to revalidate
 */
export function revalidateMultiplePaths(paths: string[]): void {
    try {
        paths.forEach(path => {
            revalidatePath(path);
            console.log(`✅ Cache revalidated for: ${path}`);
        });
    } catch (error) {
        console.error(`❌ Failed to revalidate paths:`, error);
    }
}

/**
 * Revalidate problem and list page together
 * Call this when admin creates a new problem
 * 
 * @param slug - The problem slug
 */
export function revalidateProblemWithList(slug: string): void {
    revalidateProblem(slug);
    revalidateProblemsListPage();
}

/**
 * Example usage in server actions:
 * 
 * ```typescript
 * "use server";
 * 
 * import { revalidateProblem } from '@/lib/revalidation';
 * 
 * export async function updateProblemAction(slug: string, data: any) {
 *     await db.problem.update({
 *         where: { slug },
 *         data
 *     });
 *     
 *     // Immediately invalidate cache
 *     revalidateProblem(slug);
 *     
 *     return { success: true };
 * }
 * ```
 */
