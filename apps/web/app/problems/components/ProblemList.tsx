"use client";

// apps/web/app/problems/components/ProblemList.tsx

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  getProblems, 
  type GetProblemsResponse, 
  type ProblemFilters, 
  type SortOption,
  type ProblemWithStatus 
} from "../actions";
import { ProblemRow } from "./ProblemRow";
import { SearchBar } from "./SearchBar";
import { FilterDropdown } from "./FilterDropdown";
import { SortDropdown } from "./SortDropdown";
import { EmptyState } from "./EmptyState";
import { LoadingSpinner } from "./LoadingSpinner";

interface ProblemListProps {
  initialData: GetProblemsResponse;
  initialFilters: ProblemFilters;
  initialSort: SortOption;
}

export function ProblemList({ 
  initialData, 
  initialFilters, 
  initialSort 
}: ProblemListProps) {
  // State Management
  const [problems, setProblems] = useState<ProblemWithStatus[]>(initialData.problems);
  const [filters, setFilters] = useState<ProblemFilters>(initialFilters);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(initialData.totalCount);

  // Navigation
  const router = useRouter();
  
  // Refs for infinite scroll and debounce
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update URL with current filters and sort
  const updateURL = useCallback((newFilters: ProblemFilters, newSort: SortOption) => {
    const params = new URLSearchParams();
    
    if (newFilters.difficulty && newFilters.difficulty !== 'ALL') {
      params.set('difficulty', newFilters.difficulty);
    }
    if (newFilters.status && newFilters.status !== 'ALL') {
      params.set('status', newFilters.status);
    }
    if (newFilters.search) {
      params.set('search', newFilters.search);
    }
    if (newSort !== 'latest') {
      params.set('sort', newSort);
    }

    const newURL = params.toString() ? `?${params.toString()}` : '';
    router.replace(`/problems${newURL}`, { scroll: false });
  }, [router]);

  // Load problems function
  const loadProblems = useCallback(async (
    newFilters: ProblemFilters, 
    newSort: SortOption, 
    page: number = 1,
    reset: boolean = false
  ) => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setLoading(true);

    try {
      const response = await getProblems({
        page,
        pageSize: 50,
        filters: newFilters,
        sort: newSort,
      });

      if (reset) {
        setProblems(response.problems);
        setCurrentPage(1);
      } else {
        setProblems(prev => [...prev, ...response.problems]);
      }

      setHasMore(response.hasMore);
      setTotalCount(response.totalCount);
      setCurrentPage(page);
      
      // Update URL
      updateURL(newFilters, newSort);
      
    } catch (error) {
      console.error('Error loading problems:', error);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [updateURL]);

  // Debounced search function
  const handleSearchWithDebounce = useCallback((searchTerm: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      const newFilters = { ...filters, search: searchTerm };
      setFilters(newFilters);
      loadProblems(newFilters, sort, 1, true);
    }, 250);
  }, [filters, sort, loadProblems]);

  // Handle filter changes
  const handleFilterChange = useCallback(async (newFilters: ProblemFilters) => {
    setFilters(newFilters);
    await loadProblems(newFilters, sort, 1, true);
  }, [sort, loadProblems]);

  // Handle sort changes
  const handleSortChange = useCallback(async (newSort: SortOption) => {
    setSort(newSort);
    await loadProblems(filters, newSort, 1, true);
  }, [filters, loadProblems]);

  // Handle search changes
  const handleSearchChange = useCallback((searchTerm: string) => {
    const newFilters = { ...filters, search: searchTerm };
    setFilters(newFilters);
    handleSearchWithDebounce(searchTerm);
  }, [filters, handleSearchWithDebounce]);

  // Load more for infinite scroll
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await loadProblems(filters, sort, currentPage + 1, false);
  }, [hasMore, loading, filters, sort, currentPage, loadProblems]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target?.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loadMore, hasMore, loading]);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar 
            value={filters.search || ''} 
            onChange={handleSearchChange}
            placeholder="Search problems by title or slug..."
          />
        </div>
        <div className="flex gap-2">
          <FilterDropdown 
            filters={filters}
            onChange={handleFilterChange}
          />
          <SortDropdown 
            sort={sort}
            onChange={handleSortChange}
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {loading && currentPage === 1 ? (
          "Loading problems..."
        ) : (
          `Showing ${problems.length} of ${totalCount} problems`
        )}
      </div>

      {/* Problems Table */}
      {problems.length === 0 && !loading ? (
        <EmptyState filters={filters} onClearFilters={() => handleFilterChange({})} />
      ) : (
        <>
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 py-3 px-4 border-b border-border text-sm font-medium text-muted-foreground">
            <div className="col-span-1">Status</div>
            <div className="col-span-6">Problem</div>
            <div className="col-span-2">Difficulty</div>
            <div className="col-span-3">Acceptance</div>
          </div>

          {/* Problem Rows */}
          <div className="space-y-1">
            {problems.map((problem) => (
              <ProblemRow 
                key={problem.id} 
                problem={problem}
                onClick={() => router.push(`/problems/${problem.slug}`)}
              />
            ))}
          </div>

          {/* Infinite Scroll Loading */}
          {hasMore && (
            <div ref={loadMoreRef} className="py-8 flex justify-center">
              {loading && <LoadingSpinner />}
            </div>
          )}

          {/* End of List Message */}
          {!hasMore && problems.length > 0 && (
            <div className="py-8 text-center text-muted-foreground">
              You&apos;ve reached the end of the list!
            </div>
          )}
        </>
      )}
    </div>
  );
}