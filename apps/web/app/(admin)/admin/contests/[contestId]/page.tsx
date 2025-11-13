// /apps/web/app/(admin)/admin/contests/[contestId]/page.tsx

import { db } from '@repo/db';
import { notFound } from 'next/navigation';
import { ContestDetailsSection } from './_components/ContestDetailsSection';
import { PublishControls } from './_components/PublishControls';
import { DeleteContestButton } from './_components/DeleteContestButton';
import { ManageContestProblems } from './_components/ManageContestProblems';
import { ErrorBoundary } from '../_components/ErrorBoundary';
import { JSX } from 'react';

/**
 * Main workspace page for editing a single contest.
 * 
 * Optimization: Single query with all needed relations to prevent N+1 issues
 */
export default async function ManageContestPage({
  params,
}: {
  params: { contestId: string };
}) : Promise<JSX.Element> {
  // Fetch contest data with all required relations in a single query
  const parameter = await params;
  let contest;
  try {
    contest = await db.contest.findUniqueOrThrow({
      where: { 
        id: parameter.contestId,
      },
      include: {
        problem: {
          include: { 
            problem: true, // Include full problem object for compatibility
          },
          orderBy: { index: 'asc' },
        },
        _count: {
          select: {
            problem: true,
            submissions: true,
          },
        },
      },
    });
    
    // FIX: Check if contest is soft-deleted
    if (contest.deletedAt) {
      console.error('Contest is deleted:', parameter.contestId);
      notFound(); // Triggers 404 page
    }
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
          <ErrorBoundary>
            <ContestDetailsSection contest={contest} />
          </ErrorBoundary>

          <ErrorBoundary>
            {/* Problem manager */}
            <ManageContestProblems
              contestId={contest.id}
              problems={contest.problem}
            />
          </ErrorBoundary>
        </div>

        {/* Right Column (Controls) */}
        <div className="space-y-6 lg:col-span-1">
          <ErrorBoundary>
            <PublishControls
              contestId={contest.id}
              isHidden={contest.hidden}
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <DeleteContestButton contestId={contest.id} />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}