// /apps/web/app/(admin)/admin/contests/[contestId]/_components/ManageContestProblems.tsx

'use client';

import { useState, lazy, Suspense } from 'react';
import type { ContestProblem, Problem } from '@prisma/client';
import { Button } from '@repo/ui/button';
import { Plus } from 'lucide-react';
import { ContestProblemRow } from './ContestProblemRow';
import { AdminEmptyState } from '../../_components/AdminEmptyState';

// Lazy load the heavy ProblemSearchModal component
const ProblemSearchModal = lazy(() => 
  import('./ProblemSearchModal').then(mod => ({ default: mod.ProblemSearchModal }))
);

// Define the type for the problem prop, which includes the nested Problem
type ContestProblemWithDetails = ContestProblem & {
  problem: Problem;
};

interface ManageContestProblemsProps {
  contestId: string;
  problems: ContestProblemWithDetails[];
}

/**
 * The main container for managing a contest's problem set.
 * It lists problems and contains the "Add Problem" modal.
 * 
 * Performance: ProblemSearchModal is lazy loaded to reduce initial bundle size
 */
export function ManageContestProblems({
  contestId,
  problems,
}: ManageContestProblemsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex items-center justify-between p-4 px-6">
          <div>
            <h3 className="text-lg font-semibold">Problems</h3>
            <p className="text-sm text-muted-foreground">
              Add, remove, and set points for problems in this contest.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
            Add Problem
          </Button>
        </div>

        <div className="border-t">
          {problems.length === 0 ? (
            <div className="p-6">
              <AdminEmptyState
                title="No Problems Added"
                description="Click 'Add Problem' to get started."
              />
            </div>
          ) : (
            <>
              {/* Fix #7: Table Headers */}
              <div className="hidden border-b bg-muted/50 px-6 py-3 sm:grid sm:grid-cols-[auto_1fr_auto_auto] sm:items-center sm:gap-4">
                <div className="w-5" aria-label="Drag handle column" />
                <div className="text-sm font-semibold text-muted-foreground">
                  Problem
                </div>
                <div className="text-sm font-semibold text-muted-foreground">
                  Points
                </div>
                <div className="text-sm font-semibold text-muted-foreground">
                  Actions
                </div>
              </div>
              
              {/* Problem Rows */}
              <div className="divide-y divide-border">
                {problems.map((cp, index) => (
                  <ContestProblemRow
                    key={cp.id}
                    contestProblem={cp}
                    index={index}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* The Modal for searching and adding problems - Lazy loaded */}
      {isModalOpen && (
        <Suspense fallback={null}>
          <ProblemSearchModal
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            contestId={contestId}
            // Pass existing problem IDs to prevent adding duplicates
            existingProblemIds={problems.map((cp) => cp.problemId)}
          />
        </Suspense>
      )}
    </>
  );
}