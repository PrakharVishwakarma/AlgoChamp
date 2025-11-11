// /apps/web/app/(admin)/admin/contests/[contestId]/_components/PublishControls.tsx

'use client';

import { useTransition } from 'react';
import { toggleContestVisibility } from '../../action';
import { Label } from '@repo/ui/label';
import { Switch } from '@repo/ui/switch'; // The component we created
import { useFlashMessageActions } from '@/context/FlashMessageContext';
import { Loader2 } from 'lucide-react';

interface PublishControlsProps {
  contestId: string;
  isHidden: boolean;
}

/**
 * A Client Component to toggle contest visibility.
 */
export function PublishControls({
  contestId,
  isHidden,
}: PublishControlsProps) {
  const [isPending, startTransition] = useTransition();
  const { showFlashMessage } = useFlashMessageActions();

  const handleToggle = (newIsHidden: boolean) => {
    startTransition(async () => {
      const result = await toggleContestVisibility(contestId, newIsHidden);
      if (result?.error) {
        showFlashMessage('error', result.error);
      } else {
        showFlashMessage(
          'success',
          `Contest is now ${newIsHidden ? 'hidden' : 'visible'}.`,
        );
      }
    });
  };

  return (
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
            onCheckedChange={(isChecked) => handleToggle(!isChecked)}
            disabled={isPending}
          />
        )}
      </div>
    </div>
  );
}