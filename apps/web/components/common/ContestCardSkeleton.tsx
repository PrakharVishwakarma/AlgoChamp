import React from "react";

export function ContestCardSkeleton() {
  return (
    <div className="block relative overflow-hidden rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-gray-100/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 animate-pulse">
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
          </div>
          <div className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>

        {/* Time Information */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-48" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-40" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="text-center space-y-1">
            <div className="h-7 bg-gray-300 dark:bg-gray-700 rounded w-12 mx-auto" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16 mx-auto" />
          </div>
          <div className="text-center space-y-1 border-x border-gray-200/50 dark:border-gray-700/50">
            <div className="h-7 bg-gray-300 dark:bg-gray-700 rounded w-12 mx-auto" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-20 mx-auto" />
          </div>
          <div className="text-center space-y-1">
            <div className="h-7 bg-gray-300 dark:bg-gray-700 rounded w-12 mx-auto" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-24 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContestCardSkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ContestCardSkeleton key={i} />
      ))}
    </div>
  );
}
