// apps/web/app/problems/actions.ts

"use server";

import { db } from "@repo/db";
import { authOptions } from "../lib/auth";
import { getServerSession } from "next-auth";
import { SubmissionStatus, Difficulty } from "@prisma/client";

// ===== TYPES AND INTERFACES =====

export type ProblemStatus = 'solved' | 'attempted' | 'unsolved';

export type SortOption = 
  | 'title_asc' 
  | 'title_desc' 
  | 'difficulty_asc' 
  | 'difficulty_desc' 
  | 'acceptance_asc' 
  | 'acceptance_desc' 
  | 'solved_asc' 
  | 'solved_desc' 
  | 'latest' 
  | 'oldest';

export interface ProblemFilters {
  difficulty?: Difficulty | 'ALL';
  status?: ProblemStatus | 'ALL';
  search?: string;
}

export interface GetProblemsOptions {
  page?: number;
  pageSize?: number;
  filters?: ProblemFilters;
  sort?: SortOption;
}

export interface ProblemWithStatus {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  acceptanceRate: number;
  userStatus: ProblemStatus;
  solvedCount: number;
  createdAt: Date;
}

export interface GetProblemsResponse {
  problems: ProblemWithStatus[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
}

// ===== HELPER FUNCTIONS =====

/**
 * Build Prisma orderBy clause based on sort option
 */
function buildOrderByClause(sort: SortOption) {
  switch (sort) {
    case 'title_asc':
      return { title: 'asc' as const };
    case 'title_desc':
      return { title: 'desc' as const };
    case 'difficulty_asc':
      return { difficulty: 'asc' as const };
    case 'difficulty_desc':
      return { difficulty: 'desc' as const };
    case 'solved_asc':
      return { solved: 'asc' as const };
    case 'solved_desc':
      return { solved: 'desc' as const };
    case 'latest':
      return { createdAt: 'desc' as const };
    case 'oldest':
      return { createdAt: 'asc' as const };
    default:
      return { createdAt: 'desc' as const };
  }
}

/**
 * Build Prisma where clause based on filters
 */
function buildWhereClause(filters: ProblemFilters, userId?: string) {
  const whereClause: Record<string, unknown> = {
    hidden: false // Always filter out hidden problems
  };

  // Difficulty filter
  if (filters.difficulty && filters.difficulty !== 'ALL') {
    whereClause.difficulty = filters.difficulty;
  }

  // Search filter - search in title and slug
  if (filters.search && filters.search.trim()) {
    whereClause.OR = [
      {
        title: {
          contains: filters.search.trim(),
          mode: 'insensitive'
        }
      },
      {
        slug: {
          contains: filters.search.trim(),
          mode: 'insensitive'
        }
      }
    ];
  }

  // Status filter (only if user is logged in)
  if (userId && filters.status && filters.status !== 'ALL') {
    if (filters.status === 'solved') {
      whereClause.submissions = {
        some: {
          userId: userId,
          status: SubmissionStatus.AC,
        },
      };
    } else if (filters.status === 'attempted') {
      whereClause.AND = [
        {
          submissions: {
            some: { userId: userId },
          },
        },
        {
          submissions: {
            none: {
              userId: userId,
              status: SubmissionStatus.AC,
            },
          },
        },
      ];
    } else if (filters.status === 'unsolved') {
      whereClause.submissions = {
        none: {
          userId: userId,
        },
      };
    }
  }

  return whereClause;
}

/**
 * Calculate acceptance rate from submission data
 * ✅ Optimized to use a single aggregated query
 */
async function calculateAcceptanceRates(problemIds: string[]): Promise<Record<string, number>> {
  if (problemIds.length === 0) return {};

  // ✅ Single optimized query using aggregation
  const submissionStats = await db.submission.groupBy({
    by: ['problemId', 'status'],
    where: {
      problemId: { in: problemIds }
    },
    _count: {
      id: true
    }
  });

  const acceptanceRates: Record<string, number> = {};
  
  // Process aggregated results
  const problemStats: Record<string, { total: number; accepted: number }> = {};
  
  submissionStats.forEach(stat => {
    if (!problemStats[stat.problemId]) {
      problemStats[stat.problemId] = { total: 0, accepted: 0 };
    }
    
    const stats = problemStats[stat.problemId]!;
    stats.total += stat._count.id;
    
    if (stat.status === SubmissionStatus.AC) {
      stats.accepted += stat._count.id;
    }
  });

  // Calculate rates
  problemIds.forEach(id => {
    const stats = problemStats[id];
    if (stats && stats.total > 0) {
      acceptanceRates[id] = parseFloat(((stats.accepted / stats.total) * 100).toFixed(1));
    } else {
      acceptanceRates[id] = 0;
    }
  });

  return acceptanceRates;
}

// ===== MAIN SERVER ACTION =====

/**
 * A Server Action to fetch a paginated and filtered list of problems.
 * This function is the single source of truth for loading problems for the /problems page.
 */
export async function getProblems(
  options: GetProblemsOptions = {}
): Promise<GetProblemsResponse> {
  try {
    // 1. Set defaults and get user session
    const { 
      page = 1, 
      pageSize = 50, 
      filters = {}, 
      sort = 'latest' 
    } = options;
    
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const skip = (page - 1) * pageSize;

    // 2. Build dynamic Prisma queries
    const whereClause = buildWhereClause(filters, userId);
    const orderByClause = buildOrderByClause(sort);

    // 3. Get total count for pagination
    const totalCount = await db.problem.count({
      where: whereClause
    });

    // 4. Fetch the paginated list of problems with optimized selection
    const problems = await db.problem.findMany({
      where: whereClause,
      take: pageSize,
      skip: skip,
      orderBy: orderByClause,
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        solved: true,
        createdAt: true,
        // ✅ Only include submission data if we need it for status filtering
        ...(userId && filters.status && filters.status !== 'ALL' && {
          submissions: {
            where: { userId },
            select: { status: true },
            take: 1
          }
        })
      },
    });

    if (problems.length === 0) {
      return {
        problems: [],
        totalCount,
        hasMore: false,
        currentPage: page,
      };
    }

    // 5. ✅ Optimized: calculate acceptance rates and user statuses in parallel
    const problemIds = problems.map(p => p.id);
    
    const [acceptanceRates, userSubmissions] = await Promise.all([
      calculateAcceptanceRates(problemIds),
      // Only fetch user submissions if user is logged in
      userId ? db.submission.findMany({
        where: {
          userId: userId,
          problemId: { in: problemIds },
        },
        select: {
          problemId: true,
          status: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      }) : Promise.resolve([])
    ]);

    // 6. ✅ Optimized user status calculation
    const problemStatuses: Record<string, { solved: boolean; attempted: boolean }> = {};
    
    if (userId && userSubmissions.length > 0) {
      for (const submission of userSubmissions) {
        if (!problemStatuses[submission.problemId]) {
          problemStatuses[submission.problemId] = { solved: false, attempted: false };
        }
        
        const status = problemStatuses[submission.problemId]!;
        status.attempted = true;
        
        if (submission.status === SubmissionStatus.AC) {
          status.solved = true;
        }
      }
    }

    // 7. Combine data and calculate derived fields
    const enrichedProblems: ProblemWithStatus[] = problems.map(problem => {
      const status = problemStatuses[problem.id];
      let userStatus: ProblemStatus = 'unsolved';
      
      if (status?.solved) {
        userStatus = 'solved';
      } else if (status?.attempted) {
        userStatus = 'attempted';
      }

      return {
        id: problem.id,
        slug: problem.slug,
        title: problem.title,
        difficulty: problem.difficulty,
        acceptanceRate: acceptanceRates[problem.id] || 0,
        userStatus,
        solvedCount: problem.solved,
        createdAt: problem.createdAt,
      };
    });

    // 8. Handle acceptance rate sorting (needs to be done after calculation)
    if (sort === 'acceptance_asc' || sort === 'acceptance_desc') {
      enrichedProblems.sort((a, b) => {
        const comparison = a.acceptanceRate - b.acceptanceRate;
        return sort === 'acceptance_asc' ? comparison : -comparison;
      });
    }

    const hasMore = skip + problems.length < totalCount;

    return {
      problems: enrichedProblems,
      totalCount,
      hasMore,
      currentPage: page,
    };

  } catch (error) {
    // ✅ Enhanced error logging with context
    console.error('❌ Error fetching problems:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      options,
      timestamp: new Date().toISOString()
    });
    
    throw new Error('Failed to fetch problems. Please try again.');
  }
}