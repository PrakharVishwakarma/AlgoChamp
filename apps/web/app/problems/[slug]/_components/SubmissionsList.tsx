// apps/web/app/problems/[slug]/_components/SubmissionsList.tsx

"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { getSubmissions, type SubmissionHistoryItem } from '../action';
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Clock, Code } from 'lucide-react';
import { SubmissionStatus } from '@prisma/client';
import { SubmissionCodeModal } from './SubmissionCodeModal';
import { SubmissionStats } from './SubmissionStats';

interface SubmissionsListProps {
    problemId: string;
}

const PAGE_SIZE = 20; // Must match the pageSize in the server action

// Map submission statuses to icons and colors (similar to OutputConsole)
const statusDisplayMap: Record<SubmissionStatus | string, { icon: React.ReactNode, textClass: string, label: string }> = {
    [SubmissionStatus.AC]: { icon: <CheckCircle2 size={16} />, textClass: 'text-green-500', label: 'Accepted' },
    [SubmissionStatus.REJECTED]: { icon: <XCircle size={16} />, textClass: 'text-red-500', label: 'Rejected' },
    [SubmissionStatus.COMPILATION_ERROR]: { icon: <AlertTriangle size={16} />, textClass: 'text-yellow-500', label: 'Compilation Error' },
    [SubmissionStatus.TLE]: { icon: <Clock size={16} />, textClass: 'text-orange-500', label: 'Time Limit Exceeded' },
    [SubmissionStatus.PENDING]: { icon: <Loader2 size={16} className="animate-spin" />, textClass: 'text-slate-500', label: 'Pending' },
    // Add other specific statuses if necessary
};


export function SubmissionsList({ problemId }: SubmissionsListProps) {
    const [submissions, setSubmissions] = useState<SubmissionHistoryItem[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ✅ Status filter state
    const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'ALL'>('ALL');

    // ✅ Code modal state
    const [selectedSubmission, setSelectedSubmission] = useState<{ id: string; language: string } | null>(null);

    // ✅ Refs for infinite scroll (same pattern as ProblemList)
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const isLoadingRef = useRef(false);

    const loadSubmissions = useCallback(async (currentPage: number, reset: boolean = false) => {
        if (isLoadingRef.current) return;
        
        isLoadingRef.current = true;
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await getSubmissions({ 
                problemId, 
                page: currentPage, 
                pageSize: PAGE_SIZE,
                status: statusFilter === 'ALL' ? undefined : statusFilter  // ✅ Add filter
            });
            if (result.success && result.submissions) {
                setSubmissions(prev => reset ? result.submissions! : [...prev, ...result.submissions!]);
                setHasMore(result.hasMore ?? false);
                setPage(currentPage);
            } else {
                setError(result.error || "Failed to load submissions.");
                setHasMore(false); // Stop loading on error
            }
        } catch (error) {
            console.error('Error loading submissions:', error);
            setError("An unexpected error occurred.");
            setHasMore(false);
        } finally {
            setIsLoading(false);
            isLoadingRef.current = false;
        }
    }, [problemId, statusFilter]);  // ✅ Add statusFilter dependency

    // Initial load and reload when filter changes
    useEffect(() => {
        loadSubmissions(1, true);
    }, [statusFilter, loadSubmissions]);  // ✅ Reset to page 1 when filter changes

    // ✅ Poll for pending submissions to get real-time updates
    useEffect(() => {
        const hasPending = submissions.some(sub => sub.status === SubmissionStatus.PENDING);
        
        if (!hasPending) return;

        const pollInterval = setInterval(() => {
            // Refresh first page to check for status updates
            loadSubmissions(1, true);
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(pollInterval);
    }, [submissions, loadSubmissions]);

    // ✅ Load more callback for infinite scroll
    const loadMore = useCallback(() => {
        if (!hasMore || isLoading) return;
        loadSubmissions(page + 1, false);
    }, [hasMore, isLoading, page, loadSubmissions]);

    // ✅ Intersection Observer for infinite scroll (same pattern as ProblemList)
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target?.isIntersecting && hasMore && !isLoading) {
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
    }, [loadMore, hasMore, isLoading]);

    return (
        <div className="bg-card/95 backdrop-blur-sm p-4 rounded-lg border border-border/50 h-full overflow-y-auto custom-scrollbar-enhanced shadow-lg">
            {/* Header with filter */}
            <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
                <h2 className="text-xl font-semibold text-foreground">My Submissions</h2>
                
                {/* ✅ Status filter dropdown */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as SubmissionStatus | 'ALL')}
                    className="text-sm bg-muted text-foreground rounded-md px-3 py-2 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    aria-label="Filter by status"
                >
                    <option value="ALL">All Status</option>
                    <option value={SubmissionStatus.AC}>Accepted</option>
                    <option value={SubmissionStatus.REJECTED}>Rejected</option>
                    <option value={SubmissionStatus.TLE}>Time Limit</option>
                    <option value={SubmissionStatus.COMPILATION_ERROR}>Compilation Error</option>
                    <option value={SubmissionStatus.PENDING}>Pending</option>
                </select>
            </div>

            {/* ✅ Statistics */}
            {submissions.length > 0 && <SubmissionStats submissions={submissions} />}

            {error && <p className="text-destructive text-sm mb-4 p-2 bg-destructive/10 rounded border border-destructive/20">{error}</p>}

            {submissions.length === 0 && !isLoading && !error && (
                <p className="text-muted-foreground text-center py-8">
                    {statusFilter === 'ALL' 
                        ? 'No submissions found for this problem yet.' 
                        : `No ${statusFilter.toLowerCase()} submissions found.`}
                </p>
            )}

            {submissions.length > 0 && (
                <div className="divide-y divide-border/30">
                    {submissions.map(sub => {
                        const displayInfo = statusDisplayMap[sub.status] || {
                            icon: '?', textClass: 'text-muted-foreground', label: sub.status
                        };
                        return (
                            <div key={sub.id} className="py-3 px-3 hover:bg-muted/50 rounded-lg transition-all duration-200 hover:shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <div className={`flex items-center gap-2 font-medium text-sm ${displayInfo.textClass}`}>
                                        {displayInfo.icon}
                                        <span>{displayInfo.label}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground" title={new Date(sub.createdAt).toLocaleString()}>
                                        {new Date(sub.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                                    <span className="font-medium">{sub.language.name}</span>
                                    <div className="flex gap-3">
                                        {sub.time !== null && <span>⏱️ {sub.time.toFixed(3)}s</span>}
                                        {sub.memory !== null && <span>💾 {sub.memory} KB</span>}
                                    </div>
                                </div>
                                {/* ✅ View Code Button */}
                                <button 
                                    onClick={() => setSelectedSubmission({ id: sub.id, language: sub.language.name })}
                                    className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md px-2 py-1 bg-primary/10 hover:bg-primary/20"
                                    aria-label="View submission code"
                                >
                                    <Code size={14} />
                                    View Code
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Loading indicator for infinite scroll */}
            {isLoading && submissions.length > 0 && (
                <div className="flex justify-center items-center py-4 text-muted-foreground">
                    <Loader2 className="animate-spin mr-2" size={16} /> Loading...
                </div>
            )}

            {/* ✅ Infinite scroll trigger - same pattern as ProblemList */}
            {hasMore && (
                <div ref={loadMoreRef} className="h-1" />
            )}

            {!hasMore && submissions.length > 0 && (
                <p className="text-center text-slate-600 text-xs pt-4">No more submissions.</p>
            )}

            {/* ✅ Code Viewer Modal */}
            {selectedSubmission && (
                <SubmissionCodeModal
                    submissionId={selectedSubmission.id}
                    language={selectedSubmission.language}
                    onClose={() => setSelectedSubmission(null)}
                />
            )}
        </div>
    );
}