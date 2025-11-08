-- AlterTable
ALTER TABLE "public"."Problem" ADD COLUMN     "totalSubmissions" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Problem_difficulty_idx" ON "public"."Problem"("difficulty");

-- CreateIndex
CREATE INDEX "Problem_solved_idx" ON "public"."Problem"("solved");

-- CreateIndex
CREATE INDEX "Problem_totalSubmissions_idx" ON "public"."Problem"("totalSubmissions");

-- CreateIndex
CREATE INDEX "Problem_hidden_difficulty_idx" ON "public"."Problem"("hidden", "difficulty");

-- CreateIndex
CREATE INDEX "Problem_createdAt_idx" ON "public"."Problem"("createdAt");

-- CreateIndex
CREATE INDEX "Submission_userId_problemId_status_idx" ON "public"."Submission"("userId", "problemId", "status");

-- CreateIndex
CREATE INDEX "Submission_createdAt_idx" ON "public"."Submission"("createdAt");

-- CreateIndex
CREATE INDEX "TestCase_submissionId_status_idx" ON "public"."TestCase"("submissionId", "status");

-- CreateIndex
CREATE INDEX "TestCase_judge0TrackingId_idx" ON "public"."TestCase"("judge0TrackingId");

-- CreateIndex
CREATE INDEX "TestCase_status_idx" ON "public"."TestCase"("status");
