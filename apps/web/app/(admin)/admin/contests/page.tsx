// /apps/web/app/(admin)/admin/contests/page.tsx

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ContestList, ContestListSkeleton } from './_components/ContestList';
import { ErrorBoundary } from './_components/ErrorBoundary';

// Lazy load the CreateContestModal since it's a heavy component with forms
const CreateContestModal = dynamic(
  () => import('./_components/CreateContestModal').then(mod => ({ default: mod.CreateContestModal })),
  { 
    // ssr: false, // Don't render on server since it's a modal
    loading: () => (
      <button 
        disabled 
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-50 cursor-not-allowed"
      >
        Loading...
      </button>
    )
  }
);

/**
 * Main Admin Contests Page
 * Fetches all contests and displays them in a list.
 * 
 * Error Handling: Wrapped in ErrorBoundary for graceful failures
 * Performance: CreateContestModal lazy loaded to reduce initial bundle size
 */
export default async function AdminContestsPage() {
  return (
    <div className="container mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Contests</h1>
        {/* The CreateContestModal component includes its own trigger button */}
        <ErrorBoundary>
          <CreateContestModal />
        </ErrorBoundary>
      </div>

      <ErrorBoundary>
        <Suspense fallback={<ContestListSkeleton />}>
          <ContestList />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}