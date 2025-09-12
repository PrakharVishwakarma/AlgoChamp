// /apps/submission-webhook/src/points.ts

import { Difficulty } from '@prisma/client';

const POINT_MAPPING: Record<Difficulty, number> = {
    EASY: 250,
    MEDIUM: 500,
    HARD: 1000,
};

export const getPoints = async (
    contestId: string,
    userId: string,
    problemId: string,
    difficulty: Difficulty,
    startTime: Date,
    endTime: Date
): Promise<number> => {
    const now = new Date();
    const timeDiff = Math.abs(endTime.getTime() - startTime.getTime());

    const points = POINT_MAPPING[difficulty] ?? POINT_MAPPING.EASY;
    
    // Calculate points based on time remaining
    const timeRemaining = endTime.getTime() - now.getTime();

    // Prevent division by zero if startTime and endTime are the same
    if (timeDiff === 0) {
        return points / 2;
    }

    const totalPoints = ((timeRemaining / timeDiff) * points) + (points / 2);
    
    // Ensure points are not negative and return as integer
    return Math.max(Math.round(totalPoints), points / 2);
};