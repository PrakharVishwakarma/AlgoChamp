// apps/web/app/problems/page.tsx

import { JSX } from "react";
import { ClientNavigation } from "../../components/ClientNavigation";
import { Logo } from "../../components/Logo";
import { getProblems, type ProblemFilters, type SortOption } from "./actions";
import { ProblemList } from "./components/ProblemList";
import { Suspense } from "react";
import { ProblemListSkeleton } from "./components/ProblemListSkeleton";
import { Difficulty } from "@prisma/client";

interface ProblemsPageProps {
  searchParams: Promise<{
    difficulty?: string;
    status?: string;
    search?: string;
    sort?: string;
  }>;
}

export default async function ProblemsPage({ searchParams }: ProblemsPageProps): Promise<JSX.Element> {
  // Await the searchParams promise
  const params = await searchParams;
  
  // Parse search params into filters with proper typing
  const filters: ProblemFilters = {
    difficulty: (params.difficulty as Difficulty) || 'ALL',
    status: (params.status as 'solved' | 'attempted' | 'unsolved' | 'ALL') || 'ALL',
    search: params.search || '',
  };

  const sort = (params.sort as SortOption) || 'latest';

  // Fetch initial data on the server
  const initialData = await getProblems({
    page: 1,
    pageSize: 50,
    filters,
    sort,
  });

  return (
    <div className="min-h-screen bg-background">
      <ClientNavigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-6">
            <Logo size="lg" className="mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Practice Problems</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your challenge and start solving! Track your progress and improve your skills.
          </p>
        </div>

        {/* Problem List with Server-Side Rendering */}
        <Suspense fallback={<ProblemListSkeleton />}>
          <ProblemList 
            initialData={initialData}
            initialFilters={filters}
            initialSort={sort}
          />
        </Suspense>
      </main>
    </div>
  );
}
