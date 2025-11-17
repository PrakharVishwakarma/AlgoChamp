"use client";

import React, { useState, useEffect } from "react";
import { getTimeRemaining } from "@/lib/utils/formatDuration";

interface ContestCountdownProps {
  targetDate: Date;
  type?: "starts" | "ends";
  className?: string;
}

export function ContestCountdown({
  targetDate,
  type = "starts",
  className = "",
}: ContestCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState(() =>
    getTimeRemaining(targetDate)
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTimeRemaining(getTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
      </div>
    );
  }

  if (timeRemaining.total <= 0) {
    return (
      <div className={`text-sm font-medium ${className}`}>
        {type === "starts" ? "Started" : "Ended"}
      </div>
    );
  }

  const { days, hours, minutes, seconds } = timeRemaining;

  const getColor = () => {
    if (type === "ends") {
      if (timeRemaining.total < 3600000) {
        // Less than 1 hour
        return "text-red-600 dark:text-red-400";
      }
      return "text-orange-600 dark:text-orange-400";
    }
    return "text-blue-600 dark:text-blue-400";
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {type === "starts" ? "Starts in:" : "Ends in:"}
      </span>
      <div className={`flex items-center gap-1.5 font-mono font-semibold ${getColor()}`}>
        {days > 0 && (
          <>
            <div className="flex flex-col items-center min-w-[2.5rem]">
              <span className="text-lg leading-none">{days}</span>
              <span className="text-[10px] uppercase text-gray-500 dark:text-gray-400">
                {days === 1 ? "day" : "days"}
              </span>
            </div>
            <span className="text-lg">:</span>
          </>
        )}
        <div className="flex flex-col items-center min-w-[2.5rem]">
          <span className="text-lg leading-none">
            {hours.toString().padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase text-gray-500 dark:text-gray-400">
            hrs
          </span>
        </div>
        <span className="text-lg">:</span>
        <div className="flex flex-col items-center min-w-[2.5rem]">
          <span className="text-lg leading-none">
            {minutes.toString().padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase text-gray-500 dark:text-gray-400">
            min
          </span>
        </div>
        {days === 0 && (
          <>
            <span className="text-lg">:</span>
            <div className="flex flex-col items-center min-w-[2.5rem]">
              <span className="text-lg leading-none">
                {seconds.toString().padStart(2, "0")}
              </span>
              <span className="text-[10px] uppercase text-gray-500 dark:text-gray-400">
                sec
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
