// /apps/web/app/(admin)/admin/contests/[contestId]/_components/DeleteContestButton.tsx

'use client';

import { useTransition } from 'react';
import { deleteContest } from '../../action';
import { Button } from '@repo/ui/button';
import { useFlashMessageActions } from '@/context/FlashMessageContext';
import { Loader2, Trash2 } from 'lucide-react';

/**
 * A Client Component for the "Delete Contest" button.
 */
export function DeleteContestButton({ contestId }: { contestId: string }) {
  const [isPending, startTransition] = useTransition();
  const { showFlashMessage } = useFlashMessageActions();

  const handleDelete = () => {
    // 1. Confirm with the user
    if (
      !window.confirm(
        'Are you sure you want to delete this contest? This action is irreversible and will delete all associated submissions and leaderboard data.',
      )
    ) {
      return;
    }

    // 2. Start the transition
    startTransition(async () => {
      const result = await deleteContest(contestId);
      // This will only be hit if an error occurs,
      // as success results in a redirect.
      if (result?.error) {
        showFlashMessage('error', result.error);
      }
    });
  };

  return (
    <div className="rounded-lg border border-destructive/50 bg-card p-6 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold text-destructive">
        Danger Zone
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Deleting this contest is permanent. All associated problems,
        submissions, and leaderboard data will be lost.
      </p>
      <Button
        variant="danger"
        onClick={handleDelete}
        disabled={isPending}
        className="w-full"
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="mr-2 h-4 w-4" />
        )}
        {isPending ? 'Deleting...' : 'Delete This Contest'}
      </Button>
    </div>
  );
}