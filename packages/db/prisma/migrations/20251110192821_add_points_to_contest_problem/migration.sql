/*
  Warnings:

  - Added the required column `lastSuccessfulSubmissionAt` to the `ContestPoints` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ContestPoints" DROP CONSTRAINT "ContestPoints_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ContestProblem" DROP CONSTRAINT "ContestProblem_contestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ContestProblem" DROP CONSTRAINT "ContestProblem_problemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ContestSubmission" DROP CONSTRAINT "ContestSubmission_contestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ContestSubmission" DROP CONSTRAINT "ContestSubmission_problemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ContestSubmission" DROP CONSTRAINT "ContestSubmission_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ContestSubmission" DROP CONSTRAINT "ContestSubmission_userId_fkey";

-- DropIndex
DROP INDEX "public"."ContestPoints_contestId_points_idx";

-- AlterTable
ALTER TABLE "public"."ContestPoints" ADD COLUMN     "lastSuccessfulSubmissionAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."ContestProblem" ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 100;

-- CreateIndex
CREATE INDEX "ContestPoints_contestId_points_lastSuccessfulSubmissionAt_idx" ON "public"."ContestPoints"("contestId", "points" DESC, "lastSuccessfulSubmissionAt" ASC);

-- CreateIndex
CREATE INDEX "Submission_userId_problemId_createdAt_idx" ON "public"."Submission"("userId", "problemId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "public"."ContestProblem" ADD CONSTRAINT "ContestProblem_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "public"."Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContestProblem" ADD CONSTRAINT "ContestProblem_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "public"."Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContestSubmission" ADD CONSTRAINT "ContestSubmission_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "public"."Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContestSubmission" ADD CONSTRAINT "ContestSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContestSubmission" ADD CONSTRAINT "ContestSubmission_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "public"."Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContestSubmission" ADD CONSTRAINT "ContestSubmission_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "public"."Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContestPoints" ADD CONSTRAINT "ContestPoints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContestPoints" ADD CONSTRAINT "ContestPoints_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "public"."Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
