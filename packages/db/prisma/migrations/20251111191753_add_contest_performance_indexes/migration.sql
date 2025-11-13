-- CreateIndex
CREATE INDEX "Contest_hidden_startTime_idx" ON "public"."Contest"("hidden", "startTime" DESC);

-- CreateIndex
CREATE INDEX "Contest_createdAt_idx" ON "public"."Contest"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Contest_startTime_endTime_idx" ON "public"."Contest"("startTime", "endTime");

-- CreateIndex
CREATE INDEX "Contest_hidden_createdAt_idx" ON "public"."Contest"("hidden", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ContestProblem_contestId_index_idx" ON "public"."ContestProblem"("contestId", "index");

-- CreateIndex
CREATE INDEX "ContestSubmission_userId_contestId_idx" ON "public"."ContestSubmission"("userId", "contestId");

-- CreateIndex
CREATE INDEX "ContestSubmission_contestId_problemId_idx" ON "public"."ContestSubmission"("contestId", "problemId");
