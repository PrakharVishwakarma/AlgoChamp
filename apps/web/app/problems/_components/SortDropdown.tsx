// apps/web/app/problems/components/SortDropdown.tsx

import { useState } from "react";
import { ChevronDown, ArrowUpDown } from "lucide-react";
import { SortOption } from "../actions";

interface SortDropdownProps {
  sort: SortOption;
  onChange: (sort: SortOption) => void;
}

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest Added' },
  { value: 'oldest', label: 'Oldest Added' },
  { value: 'title_asc', label: 'Title A-Z' },
  { value: 'title_desc', label: 'Title Z-A' },
  { value: 'difficulty_asc', label: 'Difficulty: Easy to Hard' },
  { value: 'difficulty_desc', label: 'Difficulty: Hard to Easy' },
  { value: 'acceptance_asc', label: 'Acceptance: Low to High' },
  { value: 'acceptance_desc', label: 'Acceptance: High to Low' },
  { value: 'solved_asc', label: 'Solved: Less to More' },
  { value: 'solved_desc', label: 'Solved: More to Less' },
] as const;

export function SortDropdown({ sort, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-input rounded-md bg-background text-foreground hover:bg-accent transition-colors"
      >
        <ArrowUpDown className="w-4 h-4" />
        <span className="hidden sm:inline">Sort</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-md shadow-lg z-20">
            <div className="p-2">
              <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b border-border mb-2">
                Sort by
              </div>
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    sort === option.value 
                      ? 'bg-accent text-accent-foreground' 
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}