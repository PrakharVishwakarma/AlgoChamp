// /apps/web/app/(admin)/admin/contests/_components/ContestFilters.tsx

'use client';

import { useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Search, X } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { useDebouncedCallback } from '@/hooks/use-debounce';

/**
 * Filter controls for the contest list.
 * Supports search and status filtering with URL state management.
 */
export function ContestFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get('search') || '';
  const currentStatus = searchParams.get('status') || 'all';

  // Debounced search to avoid excessive re-renders
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    
    // Reset to page 1 when searching
    params.set('page', '1');
    
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }, 300) as (term: string) => void;

  const handleStatusChange = useCallback(
    (status: string) => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (status === 'all') {
        params.delete('status');
      } else {
        params.set('status', status);
      }
      
      // Reset to page 1 when filtering
      params.set('page', '1');
      
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const handleClearFilters = useCallback(() => {
    startTransition(() => {
      router.push('/admin/contests');
    });
  }, [router]);

  const hasActiveFilters = currentSearch || currentStatus !== 'all';

  return (
    <div className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
        {/* Search Input */}
        <div className="flex-1">
          <Label htmlFor="search" className="sr-only">
            Search contests
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Search contests by title..."
              defaultValue={currentSearch}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          <Button
            variant={currentStatus === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange('all')}
            disabled={isPending}
          >
            All
          </Button>
          <Button
            variant={currentStatus === 'visible' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange('visible')}
            disabled={isPending}
          >
            Visible
          </Button>
          <Button
            variant={currentStatus === 'hidden' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange('hidden')}
            disabled={isPending}
          >
            Hidden
          </Button>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            disabled={isPending}
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
