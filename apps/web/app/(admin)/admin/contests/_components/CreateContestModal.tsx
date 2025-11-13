// /apps/web/app/(admin)/admin/contests/_components/CreateContestModal.tsx

'use client';

import {
  useState,
  useEffect,
  useActionState, // CORRECTED: The new hook name for React 19
} from 'react'; // CORRECTED: Imported from 'react'
import { useFormStatus } from 'react-dom'; // This one is correct
import { createContest } from '../action';
import type { CreateContestState } from '../action';
import { Button } from '@repo/ui/button';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
} from '@repo/ui/modal';
import { Input } from '@repo/ui/input';
import { Textarea } from '@repo/ui/textarea';
import { Label } from '@repo/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { useFlashMessageActions } from '@/context/FlashMessageContext';

const initialState: CreateContestState = {
  error: null,
};

/**
 * A Client Component that renders a "Create Contest" button
 * and a modal form to create a new contest.
 *
 * This version uses the STABLE React 19 form hooks.
 */
export function CreateContestModal() {
  const [isOpen, setIsOpen] = useState(false);

  // CORRECTED: Using the new 'useActionState' hook from 'react'
  const [state, formAction] = useActionState(createContest, initialState);

  const { showFlashMessage } = useFlashMessageActions();

  // Calculate min datetime (now) for date inputs
  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  useEffect(() => {
    if (state.error) {
      showFlashMessage('error', state.error);
    }
  }, [state, showFlashMessage]);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className='flex items-center gap-2'>
        <Plus className="mr-2 h-4 w-4" />
        Create Contest
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen}>
        <ModalContent>
          <form action={formAction}>
            <ModalHeader>
              <ModalTitle>Create New Contest</ModalTitle>
              <ModalDescription>
                Fill in the basic details. You can add problems after creation.
              </ModalDescription>
            </ModalHeader>
            <ModalBody className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
              <div className="col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
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
                  placeholder="What is this contest about?"
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
                  min={minDateTime}
                  required
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Contest must start in the future
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
                  min={minDateTime}
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
            </ModalBody>
            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <SubmitButton />
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}

/**
 * A separate component to use the `useFormStatus` hook.
 */
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className='flex items-center gap-2'>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Plus className="mr-2 h-4 w-4" />
      )}
      {pending ? 'Creating...' : 'Create and Continue'}
    </Button>
  );
}