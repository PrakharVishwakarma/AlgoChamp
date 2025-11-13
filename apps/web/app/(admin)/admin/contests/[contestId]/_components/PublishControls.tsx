// /apps/web/app/(admin)/admin/contests/[contestId]/_components/PublishControls.tsx

'use client';

import { useState, useTransition } from 'react';
import { toggleContestVisibility } from '../../action';
import { Label } from '@repo/ui/label';
import { Switch } from '@repo/ui/switch'; // The component we created
import { useFlashMessageActions } from '@/context/FlashMessageContext';
import { Loader2 } from 'lucide-react';
import { ConfirmDialog } from '../../_components/ConfirmDialog';

interface PublishControlsProps {
  contestId: string;
  isHidden: boolean;
}

/**
 * A Client Component to toggle contest visibility.
 * 
 * Fix #6: Added confirmation dialog before publishing/hiding
 */
export function PublishControls({
  contestId,
  isHidden,
}: PublishControlsProps) {
  const [isPending, startTransition] = useTransition();
  const { showFlashMessage } = useFlashMessageActions();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingState, setPendingState] = useState<boolean | null>(null);

  const handleToggleClick = (newIsHidden: boolean) => {
    // Store the pending state and show confirmation
    setPendingState(newIsHidden);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (pendingState === null) return;

    setShowConfirm(false);
    startTransition(async () => {
      const result = await toggleContestVisibility(contestId, pendingState);
      if (result?.error) {
        showFlashMessage('error', result.error);
      } else {
        showFlashMessage(
          'success',
          `Contest is now ${pendingState ? 'hidden' : 'visible'}.`,
        );
      }
      setPendingState(null);
    });
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setPendingState(null);
  };

  // Get confirmation message based on action
  const getConfirmationContent = () => {
    if (pendingState === false) {
      // Publishing
      return {
        title: 'Publish Contest?',
        message: 'This will make the contest visible to all users. Are you sure you want to publish?',
        variant: 'primary' as const,
      };
    } else {
      // Hiding
      return {
        title: 'Hide Contest?',
        message: 'This will make the contest invisible to users. They won\'t be able to access it. Are you sure?',
        variant: 'danger' as const,
      };
    }
  };

  const confirmContent = getConfirmationContent();

  return (
    <>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Publish Status
        </h3>
        <div className="flex items-center justify-between">
          <Label htmlFor="publish-toggle" className="flex-1 pr-4">
            {isHidden ? 'Hidden (Draft)' : 'Visible (Published)'}
            <p className="text-xs font-normal text-muted-foreground">
              {isHidden
                ? 'Users cannot see this contest.'
                : 'This contest is live and visible to users.'}
            </p>
          </Label>
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <Switch
              id="publish-toggle"
              checked={!isHidden}
              onCheckedChange={(isChecked) => handleToggleClick(!isChecked)}
              disabled={isPending}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onOpenChange={(open) => !open && handleCancel()}
        onConfirm={handleConfirm}
        title={confirmContent.title}
        description={confirmContent.message}
        variant={confirmContent.variant}
        confirmText={pendingState === false ? 'Publish' : 'Hide'}
        cancelText="Cancel"
        isLoading={isPending}
      />
    </>
  );
}