// apps/web/app/problems/components/FilterDropdown.tsx

import { useState } from "react";
import { ChevronDown, Filter } from "lucide-react";
import { ProblemFilters } from "../actions";

interface FilterDropdownProps {
  filters: ProblemFilters;
  onChange: (filters: ProblemFilters) => void;
}

const DIFFICULTY_OPTIONS = [
  { value: 'ALL', label: 'All Difficulties' },
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
] as const;

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Status' },
  { value: 'solved', label: 'Solved' },
  { value: 'attempted', label: 'Attempted' },
  { value: 'unsolved', label: 'Unsolved' },
] as const;

export function FilterDropdown({ filters, onChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof ProblemFilters, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value === 'ALL' ? 'ALL' : value,
    };
    onChange(newFilters);
  };

  const activeFiltersCount = Object.entries(filters).filter(([, value]) => 
    value && value !== 'ALL' && value !== ''
  ).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-input rounded-md bg-background text-foreground hover:bg-accent transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
        {activeFiltersCount > 0 && (
          <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
            {activeFiltersCount}
          </span>
        )}
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-md shadow-lg z-20">
            <div className="p-4 space-y-4">
              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Difficulty
                </label>
                <select
                  value={filters.difficulty || 'ALL'}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <select
                  value={filters.status || 'ALL'}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => onChange({ difficulty: 'ALL', status: 'ALL', search: filters.search })}
                  className="w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}