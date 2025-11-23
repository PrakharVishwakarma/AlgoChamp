// apps/web/app/contests/[contestId]/problem/[slug]/_components/ContestTimer.tsx

'use client';

import { useState, useEffect, memo } from 'react';
import { Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ContestTimerProps {
    endTime: Date;
    isLive: boolean;
    isVirtualMode: boolean;
}

function ContestTimerComponent({ endTime, isLive, isVirtualMode }: ContestTimerProps) {
    const router = useRouter();
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

    useEffect(() => {
        if (!isLive || isVirtualMode) return;

        const updateTimer = () => {
            const now = new Date();
            const end = new Date(endTime);
            const remaining = end.getTime() - now.getTime();
            
            if (remaining <= 0) {
                setTimeRemaining(0);
                router.refresh(); // Refresh to update contest state
            } else {
                setTimeRemaining(remaining);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [endTime, isLive, isVirtualMode, router]);

    if (!isLive || isVirtualMode || timeRemaining === null) {
        return null;
    }

    const formatTime = (ms: number): string => {
        if (ms <= 0) return '00:00:00';
        
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
            timeRemaining < 600000 ? 'bg-red-500/10 text-red-600' : 'bg-primary/10 text-primary'
        }`}>
            <Clock className="h-3 w-3" />
            {formatTime(timeRemaining)}
        </div>
    );
}

// Memoize to prevent re-renders when parent re-renders
export const ContestTimer = memo(ContestTimerComponent);
