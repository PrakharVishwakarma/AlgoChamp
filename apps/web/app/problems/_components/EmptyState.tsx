// apps/web/app/problems/components/EmptyState.tsx

import { Search, Filter } from "lucide-react";
import { ProblemFilters } from "../actions";

interface EmptyStateProps {
  filters: ProblemFilters;
  onClearFilters: () => void;
}

export function EmptyState({ filters, onClearFilters }: EmptyStateProps) {
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    key !== 'search' && value && value !== 'ALL'
  );
  
  const hasSearchTerm = filters.search && filters.search.trim() !== '';

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {hasSearchTerm || hasActiveFilters ? (
        <>
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            {hasSearchTerm ? (
              <Search className="w-8 h-8 text-muted-foreground" />
            ) : (
              <Filter className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No problems found
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {hasSearchTerm 
              ? `No problems match your search for "${filters.search}".`
              : "No problems match your current filters."
            }
          </p>
          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Clear {hasSearchTerm && hasActiveFilters ? 'Search & Filters' : hasSearchTerm ? 'Search' : 'Filters'}
          </button>
        </>
      ) : (
        <>
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No problems available
          </h3>
          <p className="text-muted-foreground">
            There are currently no problems to display. Check back later!
          </p>
        </>
      )}
    </div>
  );
}