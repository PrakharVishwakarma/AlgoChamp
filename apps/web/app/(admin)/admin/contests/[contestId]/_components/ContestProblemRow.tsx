// /apps/web/app/(admin)/admin/contests/[contestId]/_components/ContestProblemRow.tsx

'use client';

import {
  useActionState, 
  useTransition,
  useEffect,
  useState,
  memo,
  useCallback,
} from 'react';
import { useFormStatus } from 'react-dom'; 
import type { ContestProblem, Problem } from '@prisma/client';
import { removeProblemFromContest, updateProblemPoints } from '../../action';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Loader2, GripVertical, Trash2, Check, X } from 'lucide-react';
import { useFlashMessageActions } from '@/context/FlashMessageContext';
import { ConfirmDialog } from '../../_components/ConfirmDialog';

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
 * 
 */
const ContestProblemRowComponent = ({
  contestProblem,
  index,
}: ContestProblemRowProps) => {
  const { showFlashMessage } = useFlashMessageActions();
  const [isRemoving, startRemoveTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const [state, formAction] = useActionState(updateProblemPoints, initialState);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentPoints, setCurrentPoints] = useState(contestProblem.points);
  const [isEditing, setIsEditing] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  // Sync currentPoints with prop only when not editing
  useEffect(() => {
    if (!isEditing) {
      setCurrentPoints(contestProblem.points);
    }
  }, [contestProblem.points, isEditing]);
  
  const isDirty = currentPoints !== contestProblem.points;

  // Handle form submission result - only process if we actually submitted
  useEffect(() => {
    if (!hasSubmitted) return;
    
    if (state.error === null) {
      // Success - close edit mode and show success indicator
      setShowSuccess(true);
      setIsEditing(false);
      setHasSubmitted(false);
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    } else if (state.error) {
      // Error - show message but stay in edit mode
      showFlashMessage('error', state.error);
      setHasSubmitted(false);
    }
  }, [state, showFlashMessage, hasSubmitted]);

  const handleRemove = useCallback(() => {
    startRemoveTransition(async () => {
      const result = await removeProblemFromContest(contestProblem.id);
      if (result?.error) {
        showFlashMessage('error', result.error);
      } else {
        showFlashMessage('success', 'Problem removed.');
      }
    });
  }, [contestProblem.id, showFlashMessage]);

  return (
    <>
      <div className="flex flex-col gap-4 p-4 px-6 sm:grid sm:grid-cols-[auto_1fr_auto_auto] sm:items-center sm:gap-4">
        <GripVertical className="hidden h-5 w-5 cursor-grab text-muted-foreground sm:block" aria-hidden="true" />
        <div className="flex-1">
          <span className="font-semibold text-foreground">
            {String.fromCharCode(65 + index)}. {contestProblem.problem.title}
          </span>
          <p className="text-sm text-muted-foreground">
            ID: {contestProblem.problem.slug}
          </p>
        </div>

        {isEditing ? (
          <form 
            action={(formData) => {
              setHasSubmitted(true);
              formAction(formData);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="hidden"
              name="contestProblemId"
              value={contestProblem.id}
            />
            <div className="flex items-center gap-2">
              <Label htmlFor={`points-${contestProblem.id}`} className="text-sm sm:sr-only">
                Points:
              </Label>
              <Input
                id={`points-${contestProblem.id}`}
                type="number"
                name="points"
                value={currentPoints}
                onChange={(e) => setCurrentPoints(parseInt(e.target.value) || 0)}
                className="w-24"
                disabled={isRemoving}
                aria-label={`Points for ${contestProblem.problem.title}`}
                autoFocus
              />
            </div>
            <SubmitPointsButton
              showSuccess={showSuccess}
              hasError={!!state.error}
              isDirty={isDirty}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                setCurrentPoints(contestProblem.points);
              }}
              disabled={isRemoving}
              aria-label="Cancel editing points"
            >
              <X className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {contestProblem.points} pts
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              disabled={isRemoving}
              aria-label={`Edit points for ${contestProblem.problem.title}`}
            >
              Edit
            </Button>
          </div>
        )}

        {/* Remove Button */}
        <Button
          variant="danger"
          size="sm"
          onClick={() => setShowConfirm(true)}
          disabled={isRemoving}
          aria-label={`Remove ${contestProblem.problem.title} from contest`}
        >
          {isRemoving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          <span className="ml-2 sm:hidden">Remove</span>
        </Button>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleRemove}
        title="Remove Problem?"
        description={`Remove "${contestProblem.problem.title}" from this contest? This won't delete the problem itself.`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        isLoading={isRemoving}
      />
    </>
  );
};

// Export the memoized component
export const ContestProblemRow = memo(ContestProblemRowComponent);

function SubmitPointsButton({
  showSuccess,
  hasError,
  isDirty,
}: {
  showSuccess: boolean;
  hasError: boolean;
  isDirty: boolean;
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
      <Button type="submit" variant="success" size="sm" disabled>
        <Check className="h-4 w-4" />
      </Button>
    );
  }
  return (
    <Button
      type="submit"
      variant={hasError ? 'danger' : 'primary'}
      size="sm"
      disabled={!isDirty}
      aria-label="Save points"
    >
      {hasError ? <X className="h-4 w-4" /> : 'Save'}
    </Button>
  );
}