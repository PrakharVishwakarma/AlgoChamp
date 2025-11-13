// /apps/web/app/(admin)/admin/contests/[contestId]/_components/DeleteContestButton.tsx

'use client';

import { useState, useTransition } from 'react';
import { deleteContest } from '../../action';
import { Button } from '@repo/ui/button';
import { useFlashMessageActions } from '@/context/FlashMessageContext';
import { Loader2, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../../_components/ConfirmDialog';

/**
 * A Client Component for the "Delete Contest" button.
 * Uses a proper confirmation dialog instead of window.confirm
 */
export function DeleteContestButton({ contestId }: { contestId: string }) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const { showFlashMessage } = useFlashMessageActions();

  const handleDelete = () => {
    // Start the transition
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
    <>
      <div className="rounded-lg border border-destructive/50 bg-card p-6 shadow-sm">
        <h3 className="mb-2 text-lg font-semibold text-destructive">
          Danger Zone
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Deleting this contest is permanent. All associated data will be archived.
        </p>
        <Button
          variant="danger"
          onClick={() => setShowConfirm(true)}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          {isPending ? 'Deleting...' : 'Delete This Contest'}
        </Button>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleDelete}
        title="Delete Contest?"
        description="This action will archive the contest and hide it from all users. This cannot be undone."
        confirmText="Yes, Delete Contest"
        cancelText="Cancel"
        variant="danger"
        isLoading={isPending}
      />
    </>
  );
}