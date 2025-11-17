-- CreateIndex
CREATE INDEX "Contest_hidden_deletedAt_startTime_idx" ON "public"."Contest"("hidden", "deletedAt", "startTime");

-- CreateIndex
CREATE INDEX "Contest_hidden_deletedAt_endTime_idx" ON "public"."Contest"("hidden", "deletedAt", "endTime" DESC);
