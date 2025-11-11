// /apps/web/app/(admin)/admin/contests/[contestId]/page.tsx

import { db } from '@repo/db';
import { notFound } from 'next/navigation';
import { EditContestForm } from './_components/EditContestForm';
import { PublishControls } from './_components/PublishControls';
import { DeleteContestButton } from './_components/DeleteContestButton';
import { ManageContestProblems } from './_components/ManageContestProblems';
import { JSX } from 'react';

/**
 * Main workspace page for editing a single contest.
 */
export default async function ManageContestPage({
  params,
}: {
  params: { contestId: string };
}) : Promise<JSX.Element> {
  // Fetch contest data. We use findUniqueOrThrow
  // to automatically handle not found cases.
  const parameter = await params;
  let contest;
  try {
    contest = await db.contest.findUniqueOrThrow({
      where: { id: parameter.contestId },
      include: {
        problem: {
          // This include is for Phase 4
          include: { problem: true },
          orderBy: { index: 'asc' },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching contest:', error);
    notFound(); // Triggers 404 page
  }

  return (
    <div className="container mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          Manage Contest
        </h1>
        <p className="text-lg text-muted-foreground">{contest.title}</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column (Settings) */}
        <div className="space-y-8 lg:col-span-2">
          <EditContestForm contest={contest} />

          {/* This will be the problem manager in Phase 4 */}
          <ManageContestProblems
            contestId={contest.id}
            problems={contest.problem}
          />
        </div>

        {/* Right Column (Controls) */}
        <div className="space-y-6 lg:col-span-1">
          <PublishControls
            contestId={contest.id}
            isHidden={contest.hidden}
          />
          <DeleteContestButton contestId={contest.id} />
        </div>
      </div>
    </div>
  );
}