"use client";

import React from "react";
import Link from "next/link";
import { StatusBadge, ContestStatus } from "./StatusBadge";
import { ContestWithStats } from "@/types/contest";
import {
  formatContestDuration,
  formatTimeRemaining,
} from "@/lib/utils/formatDuration";

interface ContestCardProps {
  contest: ContestWithStats;
  status: ContestStatus;
  userSubmissions?: number;
}

export function ContestCard({
  contest,
  status,
  userSubmissions,
}: ContestCardProps) {
  const getGradientClass = () => {
    switch (status) {
      case "live":
        return "from-red-500/10 via-orange-500/10 to-yellow-500/10 dark:from-red-500/20 dark:via-orange-500/20 dark:to-yellow-500/20 border-red-500/20 dark:border-red-500/30";
      case "upcoming":
        return "from-blue-500/10 via-cyan-500/10 to-teal-500/10 dark:from-blue-500/20 dark:via-cyan-500/20 dark:to-teal-500/20 border-blue-500/20 dark:border-blue-500/30";
      case "past":
        return "from-gray-500/5 via-gray-400/5 to-gray-500/5 dark:from-gray-500/10 dark:via-gray-400/10 dark:to-gray-500/10 border-gray-500/10 dark:border-gray-500/20";
    }
  };

  const duration = formatContestDuration(
    contest.startTime,
    contest.endTime
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Link
      href={`/contests/${contest.id}`}
      className={`block group relative overflow-hidden rounded-lg border bg-gradient-to-br ${getGradientClass()} transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
    >
      {/* Card Content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
              {contest.title}
            </h3>
            {contest.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {contest.description}
              </p>
            )}
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Time Information */}
        <div className="space-y-2 mb-4">
          {status === "upcoming" && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Starts in:
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {formatTimeRemaining(contest.startTime)}
              </span>
            </div>
          )}
          {status === "live" && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Ends in:</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                {formatTimeRemaining(contest.endTime)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>
              {status === "past" ? "Ended: " : "Starts: "}
              {formatDate(status === "past" ? contest.endTime : contest.startTime)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Duration: {duration}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {contest._count.problem}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Problems
            </div>
          </div>
          <div className="text-center border-x border-gray-200/50 dark:border-gray-700/50">
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {contest._count.contestsubmissions}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Submissions
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {userSubmissions ?? 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Your Submissions
            </div>
          </div>
        </div>

        {/* Leaderboard Badge */}
        {contest.leaderboard && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20 dark:border-yellow-500/30">
              <svg
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Ranked
            </span>
          </div>
        )}
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </Link>
  );
}
