"use client";

import { SubmissionStatus } from '@prisma/client';
import { CheckCircle2, XCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

interface SubmissionStatsProps {
    submissions: Array<{ status: SubmissionStatus }>;
}

export function SubmissionStats({ submissions }: SubmissionStatsProps) {
    const stats = useMemo(() => {
        const total = submissions.length;
        const accepted = submissions.filter(s => s.status === SubmissionStatus.AC).length;
        const rejected = submissions.filter(s => s.status === SubmissionStatus.REJECTED).length;
        const tle = submissions.filter(s => s.status === SubmissionStatus.TLE).length;
        const compilationError = submissions.filter(s => s.status === SubmissionStatus.COMPILATION_ERROR).length;
        const pending = submissions.filter(s => s.status === SubmissionStatus.PENDING).length;
        
        const accuracy = total > 0 ? ((accepted / total) * 100).toFixed(1) : '0.0';

        return { total, accepted, rejected, tle, compilationError, pending, accuracy };
    }, [submissions]);

    return (
        <div className="bg-muted/50 backdrop-blur-sm rounded-lg p-4 mb-4 border border-border/50">
            <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Statistics</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {/* Accepted */}
                <div className="text-center p-3 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 shadow-sm">
                    <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                        <CheckCircle2 size={14} />
                        <span className="text-lg font-bold">{stats.accepted}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Accepted</div>
                </div>
                
                {/* Rejected */}
                <div className="text-center p-3 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 shadow-sm">
                    <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
                        <XCircle size={14} />
                        <span className="text-lg font-bold">{stats.rejected}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Rejected</div>
                </div>
                
                {/* Time Limit */}
                <div className="text-center p-3 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 shadow-sm">
                    <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                        <Clock size={14} />
                        <span className="text-lg font-bold">{stats.tle}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Time Limit</div>
                </div>
                
                {/* Compilation Error */}
                <div className="text-center p-3 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 shadow-sm">
                    <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                        <AlertTriangle size={14} />
                        <span className="text-lg font-bold">{stats.compilationError}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Compile Error</div>
                </div>
                
                {/* Accuracy */}
                <div className="text-center p-3 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 shadow-sm">
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                        <span className="text-lg font-bold">{stats.accuracy}%</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
            </div>

            {stats.pending > 0 && (
                <div className="mt-3 text-xs text-center text-muted-foreground bg-muted/30 backdrop-blur-sm py-2 rounded-lg border border-border/30">
                    {stats.pending} submission{stats.pending > 1 ? 's' : ''} pending evaluation
                </div>
            )}
        </div>
    );
}
