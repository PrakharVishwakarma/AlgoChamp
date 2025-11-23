// apps/web/app/contests/actions.ts

'use server';

import { db } from '@repo/db';
import { authOptions } from '../lib/auth';
import { getServerSession } from 'next-auth/next';

/**
 * Automatically registers a user for a contest when they visit the page.
 * This is the "Frictionless Registration" logic.
 */
export async function registerForContest(contestId: string) {
  const session = await getServerSession(authOptions);

  // 1. If not logged in, we can't register them. Do nothing.
  if (!session?.user?.id) {
    return { success: false, message: "Not authenticated" };
  }

  const userId = session.user.id;

  try {
    // 2. Verify the contest exists and is accessible
    const contest = await db.contest.findUnique({
      where: { id: contestId },
      select: { 
        id: true, 
        startTime: true, 
        endTime: true,
        hidden: true 
      }
    });

    if (!contest || contest.hidden) {
       return { success: false, message: "Contest not found" };
    }

    // 3. Check if we should register (Upcoming or Live)
    // We generally allow registration even if ended (for virtual), 
    // but for the official leaderboard, it usually happens before end.
    // However, 'ContestPoints' is just a record of participation.
    // We'll perform an UPSERT to ensure idempotency.

    await db.contestPoints.upsert({
      where: {
        contestId_userId: {
          contestId: contest.id,
          userId: userId,
        },
      },
      // If they are already registered, do nothing (update nothing)
      update: {},
      // If they are NOT registered, create a fresh entry
      create: {
        contestId: contest.id,
        userId: userId,
        points: 0,
        rank: 0, // Initial rank, will be recalculated by leaderboard worker
        lastSuccessfulSubmissionAt: new Date(), // Initialize timestamp
      },
    });

    // Optional: Revalidate if we were showing a "Registered" badge
    // revalidatePath(`/contests/${contestId}`);

    return { success: true };
  } catch (error) {
    console.error("[CONTEST_REGISTRATION_ERROR]", error);
    // We generally don't want to crash the UI for a background registration fail
    return { success: false, message: "Registration failed" };
  }
}