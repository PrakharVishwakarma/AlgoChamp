// apps/web/app/contests/[contestId]/problem/[slug]/_components/ContestHeader.tsx

'use client';

import { memo } from 'react';
import { ArrowLeft, Trophy } from 'lucide-react';
import Link from 'next/link';
import { ContestTimer } from './ContestTimer';

interface ContestHeaderProps {
    contestId: string;
    contestTitle: string;
    problemLabel: string;
    points: number;
    endTime: Date;
    isLive: boolean;
    isVirtualMode: boolean;
}

function ContestHeaderComponent({ 
    contestId, 
    contestTitle, 
    problemLabel, 
    points, 
    endTime, 
    isLive, 
    isVirtualMode 
}: ContestHeaderProps) {
    return (
        <div className="flex items-center justify-between border-b bg-card px-4 py-1">
            <div className="flex items-center gap-4">
                <Link 
                    href={`/contests/${contestId}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Contest
                </Link>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{contestTitle}</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">Problem {problemLabel}</span>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                {isVirtualMode && (
                    <div className="flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-600">
                        <Trophy className="h-3 w-3" />
                        Virtual Mode
                    </div>
                )}
                
                <ContestTimer 
                    endTime={endTime} 
                    isLive={isLive} 
                    isVirtualMode={isVirtualMode} 
                />
                
                <div className="flex items-center gap-2 rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-600">
                    <Trophy className="h-3 w-3" />
                    {points} pts
                </div>
            </div>
        </div>
    );
}

// Memoize to prevent re-renders when parent state changes
export const ContestHeader = memo(ContestHeaderComponent);
