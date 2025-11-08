export function DescriptionSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            {/* Title skeleton */}
            <div className="h-8 bg-slate-700/50 rounded w-3/4"></div>
            
            {/* Paragraph skeletons */}
            <div className="space-y-3 pt-2">
                <div className="h-4 bg-slate-700/50 rounded w-full"></div>
                <div className="h-4 bg-slate-700/50 rounded w-11/12"></div>
                <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
            </div>

            {/* Code block skeleton */}
            <div className="h-32 bg-slate-700/30 rounded border border-slate-600"></div>

            {/* More paragraphs */}
            <div className="space-y-3 pt-2">
                <div className="h-4 bg-slate-700/50 rounded w-full"></div>
                <div className="h-4 bg-slate-700/50 rounded w-10/12"></div>
            </div>
        </div>
    );
}
