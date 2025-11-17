import React from "react";

export type ContestStatus = "live" | "upcoming" | "past";

interface StatusBadgeProps {
  status: ContestStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "live":
        return {
          label: "Live",
          bgClass: "bg-red-500/10 dark:bg-red-500/20",
          textClass: "text-red-600 dark:text-red-400",
          borderClass: "border-red-500/20 dark:border-red-500/30",
          dotClass: "bg-red-500",
        };
      case "upcoming":
        return {
          label: "Upcoming",
          bgClass: "bg-blue-500/10 dark:bg-blue-500/20",
          textClass: "text-blue-600 dark:text-blue-400",
          borderClass: "border-blue-500/20 dark:border-blue-500/30",
          dotClass: "bg-blue-500",
        };
      case "past":
        return {
          label: "Ended",
          bgClass: "bg-gray-500/10 dark:bg-gray-500/20",
          textClass: "text-gray-600 dark:text-gray-400",
          borderClass: "border-gray-500/20 dark:border-gray-500/30",
          dotClass: "bg-gray-500",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bgClass} ${config.textClass} ${config.borderClass} ${className}`}
    >
      {status === "live" && (
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dotClass} opacity-75`}
          ></span>
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${config.dotClass}`}
          ></span>
        </span>
      )}
      {status !== "live" && (
        <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`}></span>
      )}
      {config.label}
    </span>
  );
}
