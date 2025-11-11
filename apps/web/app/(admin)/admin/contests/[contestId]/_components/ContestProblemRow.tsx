// /apps/web/app/(admin)/admin/contests/[contestId]/_components/ContestProblemRow.tsx

'use client';

import {
  useActionState, // React 19
  useTransition,
  useEffect,
  useState,
} from 'react';
import { useFormStatus } from 'react-dom'; // React 19
import type { ContestProblem, Problem } from '@prisma/client';
import { removeProblemFromContest, updateProblemPoints } from '../../action';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Loader2, GripVertical, Trash2, Check, X } from 'lucide-react';
import { useFlashMessageActions } from '@/context/FlashMessageContext';

type ContestProblemWithDetails = ContestProblem & {
  problem: Problem;
};

interface ContestProblemRowProps {
  contestProblem: ContestProblemWithDetails;
  index: number;
}

const initialState = { error: null };

/**
 * Renders a single problem row in the ManageContestProblems list.
 * Handles its own "update points" and "remove" logic.
 */
export function ContestProblemRow({
  contestProblem,
  index,
}: ContestProblemRowProps) {
  const { showFlashMessage } = useFlashMessageActions();
  const [isRemoving, startRemoveTransition] = useTransition();

  // State for the update points form
  const [state, formAction] = useActionState(updateProblemPoints, initialState);
  const [showSuccess, setShowSuccess] = useState(false);

  // Show flash messages for row actions
  useEffect(() => {
    if (state.error === null) {
      // Successfully updated points
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    } else if (state.error) {
      showFlashMessage('error', state.error);
    }
  }, [state, showFlashMessage]);

  const handleRemove = () => {
    if (
      !window.confirm(
        `Are you sure you want to remove "${contestProblem.problem.title}" from this contest?`,
      )
    ) {
      return;
    }

    startRemoveTransition(async () => {
      const result = await removeProblemFromContest(contestProblem.id);
      if (result?.error) {
        showFlashMessage('error', result.error);
      } else {
        showFlashMessage('success', 'Problem removed.');
      }
    });
  };

  return (
    <div className="flex items-center gap-4 p-4 px-6">
      <GripVertical className="h-5 w-5 cursor-grab text-muted-foreground" />
      <div className="flex-1">
        <span className="font-semibold text-foreground">
          {String.fromCharCode(65 + index)}. {contestProblem.problem.title}
        </span>
        <p className="text-sm text-muted-foreground">
          ID: {contestProblem.problem.slug}
        </p>
      </div>

      {/* Update Points Form */}
      <form action={formAction} className="flex items-center gap-2">
        <input
          type="hidden"
          name="contestProblemId"
          value={contestProblem.id}
        />
        <Input
          type="number"
          name="points"
          defaultValue={contestProblem.points}
          className="w-24"
          disabled={isRemoving}
        />
        <SubmitPointsButton
          showSuccess={showSuccess}
          hasError={!!state.error}
        />
      </form>

      {/* Remove Button */}
      <Button
        variant="danger"
        size="sm"
        onClick={handleRemove}
        disabled={isRemoving}
      >
        {isRemoving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

function SubmitPointsButton({
  showSuccess,
  hasError,
}: {
  showSuccess: boolean;
  hasError: boolean;
}) {
  const { pending } = useFormStatus();

  if (pending) {
    return (
      <Button type="submit" variant="secondary" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }
  if (showSuccess) {
    return (
      <Button type="submit" variant="success" size="sm">
        <Check className="h-4 w-4" />
      </Button>
    );
  }
  return (
    <Button
      type="submit"
      variant={hasError ? 'danger' : 'secondary'}
      size="sm"
    >
      {hasError ? <X className="h-4 w-4" /> : 'Save'}
    </Button>
  );
}