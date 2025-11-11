// /apps/web/app/(admin)/admin/contests/page.tsx

import { Suspense } from 'react';
import { ContestList, ContestListSkeleton } from './_components/ContestList';
import { CreateContestModal } from './_components/CreateContestModal';
import { Plus } from 'lucide-react';

/**
 * Main Admin Contests Page
 * Fetches all contests and displays them in a list.
 */
export default async function AdminContestsPage() {
  return (
    <div className="container mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Contests</h1>
        {/* The CreateContestModal component includes its own trigger button */}
        <CreateContestModal />
      </div>

      <Suspense fallback={<ContestListSkeleton />}>
        <ContestList />
      </Suspense>
    </div>
  );
}