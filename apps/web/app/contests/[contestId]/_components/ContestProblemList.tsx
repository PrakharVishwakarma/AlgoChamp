// apps/web/app/contests/[contestId]/_components/ContestProblemList.tsx

import Link from 'next/link';
import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { ArrowRight } from 'lucide-react'; // Removed CheckCircle2, Lock
import type { ContestProblem, Problem } from '@prisma/client';

type ContestProblemWithDetails = ContestProblem & {
  problem: Pick<Problem, 'title' | 'slug' | 'difficulty'>;
};

interface ContestProblemListProps {
  contestId: string;
  problems: ContestProblemWithDetails[];
  isEnded?: boolean;
}

export function ContestProblemList({ contestId, problems, isEnded = false }: ContestProblemListProps) {
  return (
    <div className="space-y-4 my-8">
      <h2 className="text-2xl font-bold text-foreground">Problems</h2>
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="divide-y divide-border">
          {problems.map((cp, index) => {
            const indexLabel = String.fromCharCode(65 + index); // A, B, C...
            const problemUrl = `/contests/${contestId}/problem/${cp.problem.slug}`;

            return (
              <div
                key={cp.id}
                className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                    {indexLabel}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{cp.problem.title}</h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {cp.points} pts
                      </Badge>
                      <span className="text-xs">•</span>
                      <span className={
                        cp.problem.difficulty === 'EASY' ? 'text-green-500' :
                        cp.problem.difficulty === 'MEDIUM' ? 'text-yellow-500' :
                        'text-red-500'
                      }>
                        {cp.problem.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                <Button variant={isEnded ? "secondary" : "primary"} size="sm">
                  <Link href={problemUrl}>
                    {isEnded ? "Practice" : "Solve"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}