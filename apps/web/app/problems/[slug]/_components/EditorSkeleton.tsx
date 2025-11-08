"use client";

import { Code2 } from 'lucide-react';

/**
 * Loading skeleton for Monaco Editor
 * Shows while editor is being loaded dynamically
 */
export function EditorSkeleton() {
  return (
    <div className="h-full w-full bg-slate-900 animate-pulse flex flex-col items-center justify-center gap-4">
      <Code2 className="w-12 h-12 text-slate-600 animate-bounce" />
      <div className="space-y-2 text-center">
        <p className="text-slate-400 text-sm font-medium">Loading Code Editor...</p>
        <div className="flex gap-1 justify-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
      {/* Fake code lines */}
      <div className="w-full max-w-md space-y-2 px-8">
        <div className="h-3 bg-slate-700 rounded w-3/4" />
        <div className="h-3 bg-slate-700 rounded w-full" />
        <div className="h-3 bg-slate-700 rounded w-5/6" />
        <div className="h-3 bg-slate-700 rounded w-2/3" />
      </div>
    </div>
  );
}
