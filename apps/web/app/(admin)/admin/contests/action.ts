// /apps/web/app/(admin)/admin/contests/actions.ts

'use server';

import { db } from '@repo/db';
import { getServerSession } from 'next-auth';
import { authOptions } from "../../../lib/auth";
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { CreateContestSchema, UpdateContestSchema, UpdateProblemPointsSchema, AddProblemToContestSchema } from '@repo/zod-validation/ContestValidation';
import { z } from 'zod';
import type { Problem } from '@prisma/client';


export type CreateContestState = {
  error: string | null;
  fieldErrors?: {
    title?: string[];
    description?: string[];
    startTime?: string[];
    endTime?: string[];
    contestId?: string[];
  };
};

export type UpdateContestState = CreateContestState;

/**
 * Server Action to create a new contest.
 * Designed for use with React 19's `useFormState`.
 */
export async function createContest(
  prevState: CreateContestState, // Takes previous state
  formData: FormData,
): Promise<CreateContestState> { // Returns new state
  // 1. Authenticate and Authorize
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return { error: 'Permission Denied: You must be an admin.' };
  }

  // 2. Validate Form Data
  const validatedFields = CreateContestSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return {
      error: 'Invalid input. Please check the fields.',
      fieldErrors,
    };
  }

  const { title, description, startTime, endTime } = validatedFields.data;
  let newContest;

  // 3. Perform Database Operation
  try {
    newContest = await db.contest.create({
      data: {
        title,
        description: description || null,
        startTime,
        endTime,
        hidden: true,
      },
    });
  } catch (dbError) {
    console.error('[CREATE_CONTEST_ERROR]', dbError);
    return { error: 'Database Error: Could not create contest.' };
  }

  // 4. Revalidate and Redirect
  revalidatePath('/admin/contests');
  redirect(`/admin/contests/${newContest.id}`);
}


/**
 * Server Action to UPDATE an existing contest's details.
 */

export async function updateContest(
  prevState: UpdateContestState,
  formData: FormData,
): Promise<UpdateContestState> {
  // 1. Authenticate and Authorize
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return { error: 'Permission Denied: You must be an admin.' };
  }
  // 2. Validate Form Data
  const validatedFields = UpdateContestSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return {
      error: 'Invalid input. Please check the fields.',
      fieldErrors,
    };
  }
  const { contestId, title, description, startTime, endTime } = validatedFields.data;

  // 3. Perform Database Operation
  try {
    await db.contest.update({
      where: { id: contestId },
      data: {
        title,
        description: description || null,
        startTime,
        endTime,
      },
    });
  } catch (dbError) {
    console.error('[UPDATE_CONTEST_ERROR]', dbError);
    return { error: 'Database Error: Could not update contest.' };
  }

  // 4. Revalidate and Redirect
  revalidatePath('/admin/contests');
  redirect(`/admin/contests/${contestId}`);

  return { error: null };
}

/**
 * Server Action to TOGGLE the visibility of a contest.
 * This is not a form action, so it's called from `useTransition`.
 */
export async function toggleContestVisibility(
  contestId: string,
  isHidden: boolean,
) {
  // 1. Authenticate and Authorize
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return { error: 'Permission Denied.' };
  }

  if (!contestId || typeof contestId !== 'string') {
    return { error: 'Invalid Contest ID.' };
  }

  try {
    await db.contest.update({
      where: { id: contestId },
      data: { hidden: isHidden },
    });

    // Revalidate all paths where visibility matters
    revalidatePath('/admin/contests');
    revalidatePath(`/admin/contests/${contestId}`);
    revalidatePath('/contests'); // The public user-facing page

    return { error: null };
  } catch (dbError) {
    console.error('[TOGGLE_VISIBILITY_ERROR]', dbError);
    return { error: 'Database Error: Could not update visibility.' };
  }
}


/**
 * Server Action to DELETE a contest.
 */
export async function deleteContest(contestId: string) {
  // 1. Authenticate and Authorize
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return { error: 'Permission Denied.' };
  }

  if (!contestId || typeof contestId !== 'string') {
    return { error: 'Invalid Contest ID.' };
  }

  try {
    await db.contest.delete({
      where: { id: contestId },
    });
  } catch (dbError) {
    console.error('[DELETE_CONTEST_ERROR]', dbError);
    return { error: 'Database Error: Could not delete contest.' };
  }

  revalidatePath('/admin/contests');
  redirect('/admin/contests');
}


/**
 * Server Action to SEARCH for problems by title.
 * This is a simple action, not for forms.
 */
export async function searchProblems(query: string): Promise<Problem[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return []; // Return empty on auth failure
  }

  // Basic validation
  const validatedQuery = z.string().min(1).max(100).safeParse(query);
  if (!validatedQuery.success) {
    return [];
  }

  try {
    const problems = await db.problem.findMany({
      where: {
        title: {
          contains: validatedQuery.data,
          mode: 'insensitive',
        },
      },
      take: 10, // Limit results
    });
    return problems;
  } catch (error) {
    console.error('[SEARCH_PROBLEMS_ERROR]', error);
    return [];
  }
}

/**
 * Server Action to ADD a problem to a contest.
 * This is not a form action, so it's called from `useTransition`.
 */
export async function addProblemToContest(
  contestId: string,
  problemId: string,
): Promise<{ error: string | null }> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return { error: 'Permission Denied.' };
  }

  // 1. Validate IDs
  const validatedFields = AddProblemToContestSchema.safeParse({
    contestId,
    problemId,
  });
  if (!validatedFields.success) {
    return { error: 'Invalid IDs.' };
  }

  try {
    // 2. Check for duplicates
    const existing = await db.contestProblem.findFirst({
      where: { contestId, problemId },
    });

    if (existing) {
      return { error: 'This problem is already in the contest.' };
    }

    // 3. Find the next available index
    const maxIndexResult = await db.contestProblem.aggregate({
      where: { contestId },
      _max: { index: true },
    });
    const nextIndex = (maxIndexResult._max.index ?? -1) + 1;

    // 4. Create the link
    await db.contestProblem.create({
      data: {
        contestId,
        problemId,
        index: nextIndex,
      },
    });

    // 5. Revalidate
    revalidatePath(`/admin/contests/${contestId}`);
    return { error: null };
  } catch (dbError) {
    console.error('[ADD_PROBLEM_ERROR]', dbError);
    return { error: 'Database Error: Could not add problem.' };
  }
}

/**
 * Server Action to REMOVE a problem from a contest.
 * This is not a form action, so it's called from `useTransition`.
 */
export async function removeProblemFromContest(
  contestProblemId: string,
): Promise<{ error: string | null }> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return { error: 'Permission Denied.' };
  }

  // 1. Validate ID
  if (!z.string().cuid().safeParse(contestProblemId).success) {
    return { error: 'Invalid ID.' };
  }

  try {
    // 2. Find the record to get contestId for revalidation
    const contestProblem = await db.contestProblem.findUnique({
      where: { id: contestProblemId },
      select: { contestId: true },
    });

    if (!contestProblem) {
      return { error: 'Problem link not found.' };
    }

    // 3. Delete the record
    await db.contestProblem.delete({
      where: { id: contestProblemId },
    });

    // 4. Revalidate
    revalidatePath(`/admin/contests/${contestProblem.contestId}`);
    return { error: null };
  } catch (dbError) {
    console.error('[REMOVE_PROBLEM_ERROR]', dbError);
    return { error: 'Database Error: Could not remove problem.' };
  }
}

/**
 * Server Action to UPDATE points for a problem in a contest.
 * Designed for use with React 19's `useActionState`.
 */
export async function updateProblemPoints(
  prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return { error: 'Permission Denied.' };
  }

  // 1. Validate Form Data
  const validatedFields = UpdateProblemPointsSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!validatedFields.success) {
    // Get the first error
    const firstError =
      validatedFields.error.flatten().fieldErrors.points?.[0] ||
      validatedFields.error.flatten().fieldErrors.contestProblemId?.[0] ||
      'Invalid input.';
    return { error: firstError };
  }

  const { contestProblemId, points } = validatedFields.data;

  try {
    // 2. Update the record
    const updated = await db.contestProblem.update({
      where: { id: contestProblemId },
      data: { points },
      select: { contestId: true }, // Select contestId for revalidation
    });

    // 3. Revalidate
    revalidatePath(`/admin/contests/${updated.contestId}`);
    return { error: null };
  } catch (dbError) {
    console.error('[UPDATE_POINTS_ERROR]', dbError);
    return { error: 'Database Error: Could not update points.' };
  }
}