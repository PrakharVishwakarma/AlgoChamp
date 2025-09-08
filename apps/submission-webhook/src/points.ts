import { Difficulty } from '@prisma/client';

const POINT_MAPPING: Record<Difficulty, number> = {
    EASY: 250,
    MEDIUM: 500,
    HARD: 1000
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
    const points = POINT_MAPPING[difficulty || 'EASY'];
    
    // Calculate points based on time remaining
    const timeRemaining = endTime.getTime() - now.getTime();
    const totalPoints = ((timeRemaining / timeDiff) * points) + (points / 2);
    
    // Ensure points are not negative and return as integer
    return Math.max(Math.round(totalPoints), points / 2);
};