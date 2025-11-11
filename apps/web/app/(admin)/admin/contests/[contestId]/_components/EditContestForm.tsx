// /apps/web/app/(admin)/admin/contests/[contestId]/_components/EditContestForm.tsx

'use client';

import {
  useEffect,
  useActionState, // React 19 hook
} from 'react';
import { useFormStatus } from 'react-dom'; // React 19 hook
import { updateContest } from '../../action';
import type { UpdateContestState } from '../../action';
import type { Contest } from '@prisma/client';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Textarea } from '@repo/ui/textarea';
import { Label } from '@repo/ui/label';
import { Loader2 } from 'lucide-react';
import { useFlashMessageActions } from '@/context/FlashMessageContext';

const initialState: UpdateContestState = {
  error: null,
};

/**
 * Form for editing the core details of a contest.
 */
export function EditContestForm({ contest }: { contest: Contest }) {
  const [state, formAction] = useActionState(updateContest, initialState);
  const { showFlashMessage } = useFlashMessageActions();

  // Show flash messages on success or error
  useEffect(() => {
    if (state.error === null) {
      // state.error is null on success
      showFlashMessage('success', 'Contest details saved successfully!');
    } else if (state.error) {
      // state.error has a string on error
      showFlashMessage('error', state.error);
    }
  }, [state, showFlashMessage]);

  // Helper to format dates for <input type="datetime-local">
  const formatDateTimeLocal = (date: Date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  return (
    <form
      action={formAction}
      className="rounded-lg border bg-card p-6 shadow-sm"
    >
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        Contest Details
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Hidden input to pass the contestId */}
        <input type="hidden" name="contestId" value={contest.id} />

        <div className="col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={contest.title}
            required
          />
          {state.fieldErrors?.title && (
            <p className="mt-1 text-sm text-red-500">
              {state.fieldErrors.title[0]}
            </p>
          )}
        </div>
        <div className="col-span-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={contest.description || ''}
            placeholder="What is this contest about?"
            rows={5}
          />
        </div>
        <div>
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            name="startTime"
            type="datetime-local"
            defaultValue={formatDateTimeLocal(contest.startTime)}
            required
          />
          {state.fieldErrors?.startTime && (
            <p className="mt-1 text-sm text-red-500">
              {state.fieldErrors.startTime[0]}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            name="endTime"
            type="datetime-local"
            defaultValue={formatDateTimeLocal(contest.endTime)}
            required
          />
          {state.fieldErrors?.endTime && (
            <p className="mt-1 text-sm text-red-500">
              {state.fieldErrors.endTime[0]}
            </p>
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} size="md">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : null}
      {pending ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}