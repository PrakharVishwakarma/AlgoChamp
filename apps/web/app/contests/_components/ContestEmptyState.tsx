import React from "react";
import { ContestStatus } from "../../../components/common/StatusBadge";

interface ContestEmptyStateProps {
  status: ContestStatus;
}

export function ContestEmptyState({ status }: ContestEmptyStateProps) {
  const getContent = () => {
    switch (status) {
      case "live":
        return {
          icon: (
            <svg
              className="w-16 h-16 text-red-500/50 dark:text-red-400/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          ),
          title: "No Live Contests",
          description:
            "There are no contests running at the moment. Check back soon or browse upcoming contests!",
          gradient:
            "from-red-500/5 via-orange-500/5 to-yellow-500/5 dark:from-red-500/10 dark:via-orange-500/10 dark:to-yellow-500/10",
          borderColor: "border-red-500/10 dark:border-red-500/20",
        };
      case "upcoming":
        return {
          icon: (
            <svg
              className="w-16 h-16 text-blue-500/50 dark:text-blue-400/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          ),
          title: "No Upcoming Contests",
          description:
            "There are no scheduled contests at the moment. New contests will appear here when announced.",
          gradient:
            "from-blue-500/5 via-cyan-500/5 to-teal-500/5 dark:from-blue-500/10 dark:via-cyan-500/10 dark:to-teal-500/10",
          borderColor: "border-blue-500/10 dark:border-blue-500/20",
        };
      case "past":
        return {
          icon: (
            <svg
              className="w-16 h-16 text-gray-500/50 dark:text-gray-400/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          title: "No Past Contests",
          description:
            "There are no completed contests yet. Past contests will be available here for review.",
          gradient:
            "from-gray-500/5 via-gray-400/5 to-gray-500/5 dark:from-gray-500/10 dark:via-gray-400/10 dark:to-gray-500/10",
          borderColor: "border-gray-500/10 dark:border-gray-500/20",
        };
    }
  };

  const content = getContent();

  return (
    <div
      className={`relative overflow-hidden rounded-lg border ${content.borderColor} bg-gradient-to-br ${content.gradient} p-12 text-center`}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-current rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-current rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md mx-auto">
        <div className="flex justify-center mb-4">{content.icon}</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {content.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">{content.description}</p>
      </div>
    </div>
  );
}
