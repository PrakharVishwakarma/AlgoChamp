-- AlterTable
ALTER TABLE "public"."Contest" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Problem" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Contest_deletedAt_idx" ON "public"."Contest"("deletedAt");

-- CreateIndex
CREATE INDEX "Problem_deletedAt_idx" ON "public"."Problem"("deletedAt");
