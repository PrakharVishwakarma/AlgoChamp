// apps/web/app/contests/[contestId]/_components/ContestLeaderboard.tsx

'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Crown, TrendingUp, User } from 'lucide-react';

interface LeaderboardEntry {
    rank: number;
    userId: string;
    userName: string;
    points: number;
    solvedCount: number;
    lastSubmissionTime: Date;
}

interface ContestLeaderboardProps {
    contestId: string;
    initialData: LeaderboardEntry[];
    currentUserId?: string;
    isLive: boolean;
}

// Utility function to format relative time without external library
function formatTimeAgo(date: Date): string {
    const now = new Date();
    const secondsAgo = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (secondsAgo < 60) {
        return 'just now';
    }

    const minutesAgo = Math.floor(secondsAgo / 60);
    if (minutesAgo < 60) {
        return `${minutesAgo} ${minutesAgo === 1 ? 'minute' : 'minutes'} ago`;
    }

    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24) {
        return `${hoursAgo} ${hoursAgo === 1 ? 'hour' : 'hours'} ago`;
    }

    const daysAgo = Math.floor(hoursAgo / 24);
    if (daysAgo < 30) {
        return `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`;
    }

    const monthsAgo = Math.floor(daysAgo / 30);
    return `${monthsAgo} ${monthsAgo === 1 ? 'month' : 'months'} ago`;
}

export function ContestLeaderboard({ 
    contestId, 
    initialData, 
    currentUserId,
    isLive 
}: ContestLeaderboardProps) {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(initialData);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 50;

    // Real-time updates for live contests (using polling for now, SSE later)
    useEffect(() => {
        if (!isLive) return;

        const fetchLeaderboard = async () => {
            try {
                const response = await fetch(`/api/contests/${contestId}/leaderboard`);
                if (response.ok) {
                    const data = await response.json();
                    setLeaderboard(data.leaderboard || []);
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            }
        };

        // Poll every 10 seconds during live contests
        const interval = setInterval(fetchLeaderboard, 10000);
        return () => clearInterval(interval);
    }, [contestId, isLive]);

    // Pagination
    const totalPages = Math.ceil(leaderboard.length / ITEMS_PER_PAGE);
    const paginatedData = leaderboard.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Find current user's rank
    const currentUserEntry = leaderboard.find(entry => entry.userId === currentUserId);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="h-5 w-5 text-yellow-500" />;
            case 2:
                return <Medal className="h-5 w-5 text-gray-400" />;
            case 3:
                return <Award className="h-5 w-5 text-amber-600" />;
            default:
                return null;
        }
    };

    const getRankBadgeClass = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold';
            case 2:
                return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white font-bold';
            case 3:
                return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white font-bold';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <div className="space-y-6">
            {/* Leaderboard Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold">Leaderboard</h2>
                    {isLive && (
                        <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                            <span className="text-sm font-medium text-green-600">Live</span>
                        </div>
                    )}
                </div>
                <div className="text-sm text-muted-foreground">
                    {leaderboard.length} participants
                </div>
            </div>

            {/* Current User Highlight (if not in top 50) */}
            {currentUserEntry && currentUserEntry.rank > ITEMS_PER_PAGE && currentPage === 1 && (
                <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
                    <div className="mb-2 text-sm font-medium text-primary">Your Rank</div>
                    <div className="grid grid-cols-12 items-center gap-4">
                        <div className="col-span-1 flex justify-center">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${getRankBadgeClass(currentUserEntry.rank)}`}>
                                {currentUserEntry.rank}
                            </div>
                        </div>
                        <div className="col-span-4 font-medium">{currentUserEntry.userName}</div>
                        <div className="col-span-2 text-center font-bold text-primary">{currentUserEntry.points}</div>
                        <div className="col-span-2 text-center text-sm text-muted-foreground">{currentUserEntry.solvedCount} solved</div>
                        <div className="col-span-3 text-right text-xs text-muted-foreground">
                            {formatTimeAgo(currentUserEntry.lastSubmissionTime)}
                        </div>
                    </div>
                </div>
            )}

            {/* Leaderboard Table */}
            <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 border-b bg-muted/50 p-4 text-sm font-medium text-muted-foreground">
                    <div className="col-span-1 text-center">Rank</div>
                    <div className="col-span-4">Participant</div>
                    <div className="col-span-2 text-center">Points</div>
                    <div className="col-span-2 text-center">Solved</div>
                    <div className="col-span-3 text-right">Last Submission</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-border">
                    {paginatedData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Trophy className="mb-4 h-12 w-12 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">No submissions yet</p>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Be the first to solve a problem!
                            </p>
                        </div>
                    ) : (
                        paginatedData.map((entry) => {
                            const isCurrentUser = entry.userId === currentUserId;
                            
                            return (
                                <div
                                    key={entry.userId}
                                    className={`grid grid-cols-12 items-center gap-4 p-4 transition-colors hover:bg-muted/50 ${
                                        isCurrentUser ? 'bg-primary/5 font-medium' : ''
                                    }`}
                                >
                                    {/* Rank */}
                                    <div className="col-span-1 flex items-center justify-center gap-2">
                                        {getRankIcon(entry.rank)}
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${getRankBadgeClass(entry.rank)}`}>
                                            {entry.rank}
                                        </div>
                                    </div>

                                    {/* Participant Name */}
                                    <div className="col-span-4 flex items-center gap-2">
                                        {isCurrentUser && <User className="h-4 w-4 text-primary" />}
                                        <span className={isCurrentUser ? 'text-primary' : ''}>
                                            {entry.userName}
                                        </span>
                                    </div>

                                    {/* Points */}
                                    <div className="col-span-2 text-center">
                                        <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-bold text-primary">
                                            <TrendingUp className="h-3 w-3" />
                                            {entry.points}
                                        </div>
                                    </div>

                                    {/* Solved Count */}
                                    <div className="col-span-2 text-center text-sm text-muted-foreground">
                                        {entry.solvedCount} / {leaderboard[0]?.solvedCount || 0}
                                    </div>

                                    {/* Last Submission Time */}
                                    <div className="col-span-3 text-right text-xs text-muted-foreground">
                                        {formatTimeAgo(entry.lastSubmissionTime)}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t bg-muted/50 p-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, leaderboard.length)} of {leaderboard.length}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="rounded-lg border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="rounded-lg border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
