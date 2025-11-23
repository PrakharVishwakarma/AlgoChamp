// apps/web/app/contests/[contestId]/_components/ContestCountdown.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Timer } from 'lucide-react';

interface ContestCountdownProps {
  targetDate: Date;
  label: string;
}

export function ContestCountdown({ targetDate, label }: ContestCountdownProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } | null>(null); // ✅ Start with null to prevent hydration mismatch

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }

      return {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24) + Math.floor(difference / (1000 * 60 * 60 * 24)) * 24, // Total hours including days
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      };
    };

    // ✅ Initial calculation (client-side only)
    const initial = calculateTimeLeft();
    setTimeLeft(initial);

    // If already expired on mount, no need to start interval
    if (initial.isExpired) return;

    const timer = setInterval(() => {
      const nextTime = calculateTimeLeft();
      setTimeLeft(nextTime);

      if (nextTime.isExpired) {
        clearInterval(timer);
        router.refresh(); // Refresh the page to change state (e.g. Upcoming -> Live)
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, router]);

  // ✅ Show loading state until hydrated
  if (timeLeft === null) {
    return (
      <div className="rounded-lg border bg-primary/5 p-6 text-center">
        <h3 className="mb-4 flex items-center justify-center gap-2 text-lg font-medium text-primary">
          <Timer className="h-5 w-5" />
          {label}
        </h3>
        <div className="flex justify-center gap-4 font-mono text-4xl font-bold tracking-wider text-muted-foreground">
          <div className="flex flex-col items-center gap-1">
            <span className="animate-pulse">--</span>
            <span className="text-xs font-normal uppercase tracking-normal">Hours</span>
          </div>
          <span>:</span>
          <div className="flex flex-col items-center gap-1">
            <span className="animate-pulse">--</span>
            <span className="text-xs font-normal uppercase tracking-normal">Mins</span>
          </div>
          <span>:</span>
          <div className="flex flex-col items-center gap-1">
            <span className="animate-pulse">--</span>
            <span className="text-xs font-normal uppercase tracking-normal">Secs</span>
          </div>
        </div>
      </div>
    );
  }

  if (timeLeft.isExpired) return null;

  return (
    <div className="rounded-lg border bg-primary/5 p-6 text-center">
      <h3 className="mb-4 flex items-center justify-center gap-2 text-lg font-medium text-primary">
        <Timer className="h-5 w-5" />
        {label}
      </h3>
      <div className="flex justify-center gap-4 font-mono text-4xl font-bold tracking-wider text-foreground md:text-4xl">
        <div className="flex flex-col items-center gap-1">
          <span>{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-xs font-normal text-muted-foreground uppercase tracking-normal">Hours</span>
        </div>
        <span>:</span>
        <div className="flex flex-col items-center gap-1">
          <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-xs font-normal text-muted-foreground uppercase tracking-normal">Mins</span>
        </div>
        <span>:</span>
        <div className="flex flex-col items-center gap-1">
          <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-xs font-normal text-muted-foreground uppercase tracking-normal">Secs</span>
        </div>
      </div>
    </div>
  );
}