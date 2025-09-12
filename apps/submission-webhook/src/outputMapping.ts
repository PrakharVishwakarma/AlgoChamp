// /apps/submission-webhook/src/outputMapping.ts

import { TestCaseStatus } from '@prisma/client';

export const outputMapping: Record<string, TestCaseStatus> = {
    "Accepted": TestCaseStatus.AC,
    "Wrong Answer": TestCaseStatus.FAIL,
    "Time Limit Exceeded": TestCaseStatus.TLE,
    "Runtime Error (NZEC)": TestCaseStatus.FAIL,
    "Compilation Error": TestCaseStatus.FAIL
};