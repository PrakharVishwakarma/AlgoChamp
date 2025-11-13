// /apps/web/app/(admin)/admin/contests/[contestId]/_components/ProblemSearchModal.tsx

'use client';

import { useState, useEffect, useTransition } from 'react';
import type { Problem } from '@prisma/client';
import { searchProblems, addProblemToContest } from '../../action';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
} from '@repo/ui/modal';
import { Input } from '@repo/ui/input';
import { Button } from '@repo/ui/button';
import { Loader2, Plus, Check } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce'; // Your existing hook
import { useFlashMessageActions } from '@/context/FlashMessageContext';

interface ProblemSearchModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contestId: string;
  existingProblemIds: string[];
}

/**
 * Modal for searching and adding problems to a contest.
 */
export function ProblemSearchModal({
  isOpen,
  onOpenChange,
  contestId,
  existingProblemIds,
}: ProblemSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Problem[] | null>(null);
  const [isSearching, startSearchTransition] = useTransition();
  const debouncedQuery = useDebounce(query, 500);

  // Effect to search when debounced query changes
  useEffect(() => {
    if (!isOpen) {
      // Clear results when modal is closed
      setQuery('');
      setResults(null);
      return;
    }

    if (debouncedQuery.trim().length < 2) {
      setResults(null);
      return;
    }

    startSearchTransition(async () => {
      const problems = await searchProblems(debouncedQuery);
      setResults(problems);
    });
  }, [debouncedQuery, isOpen, startSearchTransition]);

  return (
    <Modal open={isOpen} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-xl">
        <ModalHeader>
          <ModalTitle>Add Problem to Contest</ModalTitle>
          <ModalDescription>
            Search for problems by title to add them.
          </ModalDescription>
        </ModalHeader>
        <ModalBody className="py-4">
          <Input
            placeholder="Search by title (e.g., 'Two Sum')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="mt-4 h-64 overflow-y-auto rounded-md border">
            {isSearching ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !results ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">
                  Start typing to search for problems.
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">
                  No problems found for {debouncedQuery}.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {results.map((problem) => (
                  <SearchResultRow
                    key={problem.id}
                    problem={problem}
                    contestId={contestId}
                    isAlreadyAdded={existingProblemIds.includes(problem.id)}
                    onProblemAdded={() => onOpenChange(false)}
                  />
                ))}
              </div>
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

/**
 * A single row in the search results.
 * Handles its own "Add" transition.
 */
function SearchResultRow({
  problem,
  contestId,
  isAlreadyAdded,
  onProblemAdded,
}: {
  problem: Problem;
  contestId: string;
  isAlreadyAdded: boolean;
  onProblemAdded: () => void;
}) {
  const [isAdding, startAddTransition] = useTransition();
  const { showFlashMessage } = useFlashMessageActions();

  const handleAdd = () => {
    startAddTransition(async () => {
      const result = await addProblemToContest(contestId, problem.id);
      if (result.error) {
        showFlashMessage('error', result.error);
      } else {
        showFlashMessage('success', `Added "${problem.title}".`);
        onProblemAdded(); // Close modal on success
      }
    });
  };

  return (
    <div className="flex items-center justify-between p-3">
      <div>
        <p className="font-medium text-foreground">{problem.title}</p>
        <p className="text-sm text-muted-foreground">{problem.slug}</p>
      </div>
      <Button
        size="sm"
        variant={isAlreadyAdded ? 'success' : 'secondary'}
        onClick={handleAdd}
        disabled={isAdding || isAlreadyAdded}
        className='flex items-center gap-1'
      >
        {isAdding ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : isAlreadyAdded ? (
          <Check className="mr-2 h-4 w-4" />
        ) : (
          <Plus className="mr-2 h-4 w-4" />
        )}
        {isAdding ? 'Adding...' : isAlreadyAdded ? 'Added' : 'Add'}
      </Button>
    </div>
  );
}