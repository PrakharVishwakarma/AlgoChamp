/*
  Warnings:

  - You are about to drop the column `submisionId` on the `ContestSubmission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[submissionId]` on the table `ContestSubmission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `submissionId` to the `ContestSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ContestSubmission" DROP COLUMN "submisionId",
ADD COLUMN     "submissionId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "ContestPoints_contestId_points_idx" ON "ContestPoints"("contestId", "points");

-- CreateIndex
CREATE INDEX "ContestProblem_problemId_idx" ON "ContestProblem"("problemId");

-- CreateIndex
CREATE UNIQUE INDEX "ContestSubmission_submissionId_key" ON "ContestSubmission"("submissionId");

-- CreateIndex
CREATE INDEX "ContestSubmission_contestId_idx" ON "ContestSubmission"("contestId");

-- CreateIndex
CREATE INDEX "Submission_userId_problemId_idx" ON "Submission"("userId", "problemId");

-- CreateIndex
CREATE INDEX "Submission_activeContestId_idx" ON "Submission"("activeContestId");

-- CreateIndex
CREATE INDEX "TestCase_submissionId_idx" ON "TestCase"("submissionId");

-- AddForeignKey
ALTER TABLE "ContestSubmission" ADD CONSTRAINT "ContestSubmission_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
