/*
  Warnings:

  - Added the required column `updatedAt` to the `ContestPoints` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ContestSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Contest" ADD COLUMN     "allowVirtual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxParticipants" INTEGER;

-- AlterTable
ALTER TABLE "public"."ContestPoints" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."ContestSubmission" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."UserContestRegistration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isVirtual" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserContestRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserContestRegistration_contestId_isVirtual_idx" ON "public"."UserContestRegistration"("contestId", "isVirtual");

-- CreateIndex
CREATE INDEX "UserContestRegistration_userId_registeredAt_idx" ON "public"."UserContestRegistration"("userId", "registeredAt" DESC);

-- CreateIndex
CREATE INDEX "UserContestRegistration_contestId_registeredAt_idx" ON "public"."UserContestRegistration"("contestId", "registeredAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "UserContestRegistration_userId_contestId_key" ON "public"."UserContestRegistration"("userId", "contestId");

-- CreateIndex
CREATE INDEX "ContestSubmission_userId_contestId_createdAt_idx" ON "public"."ContestSubmission"("userId", "contestId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "public"."UserContestRegistration" ADD CONSTRAINT "UserContestRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserContestRegistration" ADD CONSTRAINT "UserContestRegistration_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "public"."Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
