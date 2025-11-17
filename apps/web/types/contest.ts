import { ContestStatus } from "@/components/common/StatusBadge";

export interface ContestWithStats {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  hidden: boolean;
  leaderboard: boolean;
  _count: {
    problem: number;
    contestsubmissions: number;
  };
}

export interface ContestWithUserStats extends ContestWithStats {
  userSubmissions: number;
}

export interface ContestSectionData {
  contests: ContestWithStats[];
  totalCount: number;
  hasMore?: boolean;
  cursor?: string | null;
}

export interface ContestFilters {
  search?: string;
  status?: ContestStatus;
}

export interface TimeRemaining {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
