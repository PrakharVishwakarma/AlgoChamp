// apps/web/app/problems/components/ProblemRow.tsx

import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { ProblemWithStatus } from "../actions";

interface ProblemRowProps {
  problem: ProblemWithStatus;
  onClick: () => void;
}

const DIFFICULTY_COLORS = {
  EASY: "bg-green-100 text-green-800 border-green-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200", 
  HARD: "bg-red-100 text-red-800 border-red-200",
} as const;

const STATUS_ICONS = {
  solved: <CheckCircle className="w-5 h-5 text-green-600" />,
  attempted: <XCircle className="w-5 h-5 text-yellow-600" />,
  unsolved: <AlertCircle className="w-5 h-5 text-gray-400" />,
} as const;

export function ProblemRow({ problem, onClick }: ProblemRowProps) {
  return (
    <div 
      className="grid grid-cols-12 gap-4 py-4 px-4 hover:bg-accent/50 transition-colors border border-border rounded-lg cursor-pointer"
      onClick={onClick}
    >
      {/* Status */}
      <div className="col-span-1 flex items-center">
        {STATUS_ICONS[problem.userStatus]}
      </div>

      {/* Problem Title */}
      <div className="col-span-6 flex items-center">
        <div>
          <h3 className="font-medium text-foreground hover:text-primary transition-colors">
            {problem.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {problem.slug}
          </p>
        </div>
      </div>

      {/* Difficulty */}
      <div className="col-span-2 flex items-center">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${DIFFICULTY_COLORS[problem.difficulty]}`}>
          {problem.difficulty}
        </span>
      </div>

      {/* Acceptance Rate */}
      <div className="col-span-3 flex items-center">
        <div className="text-right">
          <div className="text-sm font-medium">
            {problem.acceptanceRate}%
          </div>
          <div className="text-xs text-muted-foreground">
            {problem.solvedCount} solved
          </div>
        </div>
      </div>
    </div>
  );
}