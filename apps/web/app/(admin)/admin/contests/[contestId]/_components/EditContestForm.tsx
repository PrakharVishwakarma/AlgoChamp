// /apps/web/app/(admin)/admin/contests/[contestId]/_components/EditContestForm.tsx

'use client';

import {
  useState,
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

interface EditContestFormProps {
  contest: Contest;
  onCancel?: () => void;
  onSuccess?: () => void;
}

/**
 * Form for editing the core details of a contest.
 * 
 * Fixes:
 * - #4: Added Cancel button with onCancel callback
 * - #1: Only shows flash messages on actual form submission (hasSubmitted tracking)
 */
export function EditContestForm({ contest, onCancel, onSuccess }: EditContestFormProps) {
  const [state, formAction] = useActionState(updateContest, initialState);
  const { showFlashMessage } = useFlashMessageActions();
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Track form values to detect changes
  const [formValues, setFormValues] = useState({
    title: contest.title,
    description: contest.description || '',
    startTime: formatDateTimeLocal(contest.startTime),
    endTime: formatDateTimeLocal(contest.endTime),
  });

  // Helper to format dates for <input type="datetime-local">
  function formatDateTimeLocal(date: Date) {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }

  // Check if form has changes (is dirty)
  const isDirty = 
    formValues.title !== contest.title ||
    formValues.description !== (contest.description || '') ||
    formValues.startTime !== formatDateTimeLocal(contest.startTime) ||
    formValues.endTime !== formatDateTimeLocal(contest.endTime);

  // Show flash messages on success or error, but only after actual submission
  useEffect(() => {
    if (!hasSubmitted) return;

    if (state.error === null) {
      // state.error is null on success
      showFlashMessage('success', 'Contest details saved successfully!');
      onSuccess?.();
      // Reset hasSubmitted after showing message
      setHasSubmitted(false);
    } else if (state.error) {
      // state.error has a string on error
      showFlashMessage('error', state.error);
      setHasSubmitted(false);
    }
  }, [state, showFlashMessage, hasSubmitted, onSuccess]);

  // Sync form values when contest prop changes (e.g., after successful save with revalidation)
  useEffect(() => {
    setFormValues({
      title: contest.title,
      description: contest.description || '',
      startTime: formatDateTimeLocal(contest.startTime),
      endTime: formatDateTimeLocal(contest.endTime),
    });
  }, [contest]);

  const handleSubmit = (formData: FormData) => {
    setHasSubmitted(true);
    formAction(formData);
  };

  return (
    <form
      action={handleSubmit}
      className="rounded-lg border bg-card p-6 shadow-sm"
    >
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        Contest Details
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Hidden input to pass the contestId */}
        <input type="hidden" name="contestId" value={contest.id} />
        
        {/* Hidden input for optimistic locking */}
        <input 
          type="hidden" 
          name="updatedAt" 
          value={contest.updatedAt.toISOString()} 
        />

        <div className="col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={formValues.title}
            onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
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
            value={formValues.description}
            onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
            placeholder="What is this contest about?"
            rows={5}
          />
          {state.fieldErrors?.description && (
            <p className="mt-1 text-sm text-red-500">
              {state.fieldErrors.description[0]}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            name="startTime"
            type="datetime-local"
            value={formValues.startTime}
            onChange={(e) => setFormValues({ ...formValues, startTime: e.target.value })}
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">
            When the contest begins
          </p>
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
            value={formValues.endTime}
            onChange={(e) => setFormValues({ ...formValues, endTime: e.target.value })}
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Duration: 15 min - 30 days from start
          </p>
          {state.fieldErrors?.endTime && (
            <p className="mt-1 text-sm text-red-500">
              {state.fieldErrors.endTime[0]}
            </p>
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <SubmitButton isDirty={isDirty} />
      </div>
    </form>
  );
}

function SubmitButton({ isDirty }: { isDirty: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      disabled={!isDirty || pending} 
      size="md" 
      className='flex items-center'
      aria-label={!isDirty ? 'No changes to save' : 'Save contest changes'}
    >
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : null}
      {pending ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}