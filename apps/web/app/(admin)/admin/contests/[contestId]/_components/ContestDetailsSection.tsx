// /apps/web/app/(admin)/admin/contests/[contestId]/_components/ContestDetailsSection.tsx

'use client';

import { useState } from 'react';
import type { Contest } from '@prisma/client';
import { ContestDetailsView } from './ContestDetailsView';
import { EditContestForm } from './EditContestForm';

interface ContestDetailsSectionProps {
  contest: Contest;
}

/**
 * Client component that manages the view/edit mode toggle for contest details.
 * 
 * Default: Shows read-only view with "Edit" button
 * Edit mode: Shows EditContestForm with "Cancel" button
 * 
 * Fixes Issues:
 * - #3: Shows read-only view by default instead of edit form
 * - #4: Provides Cancel button to exit edit mode
 * - #1: Prevents unwanted flash messages on navigation (only shown on actual submit)
 */
export function ContestDetailsSection({ contest }: ContestDetailsSectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSuccess = () => {
    // Stay in edit mode after successful save
    // User can click Cancel to return to view mode if desired
    // This prevents the form from disappearing on save
  };

  if (isEditing) {
    return (
      <EditContestForm 
        contest={contest}
        onCancel={handleCancel}
        onSuccess={handleSuccess}
      />
    );
  }

  return (
    <ContestDetailsView 
      contest={contest}
      onEdit={handleEdit}
    />
  );
}
