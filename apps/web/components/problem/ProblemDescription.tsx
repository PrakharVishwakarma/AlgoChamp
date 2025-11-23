// /apps/web/app/problems/[slug]/_components/ProblemDescription.tsx

'use client';

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Difficulty } from "@prisma/client";
import { DescriptionSkeleton } from "./DescriptionSkeleton";

// Lazy load MarkdownRenderer for better performance and code splitting
const MarkdownRenderer = dynamic(() => import("./MarkdownRenderer").then(mod => ({ default: mod.MarkdownRenderer })), {
    loading: () => <DescriptionSkeleton />,
    ssr: true, // Enable SSR for SEO
});

interface ProblemDescriptionProps {
    title: string;
    description: string;
    difficulty: Difficulty;
}

const difficultyClasses: Record<Difficulty, string> = {
    EASY: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/50',
    MEDIUM: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/50',
    HARD: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/50',
};

const difficultyLabels: Record<Difficulty, string> = {
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard',
};

export function ProblemDescription({ title, difficulty, description }: ProblemDescriptionProps) {
    return (
        <div className="prose prose-slate dark:prose-invert prose-lg max-w-none bg-card/95 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-border/50 shadow-lg transition-colors duration-200">
            {/* Header Section with Accessibility */}
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 not-prose">
                <h1 
                    className="text-2xl sm:text-3xl font-bold mb-0 text-foreground transition-colors duration-200"
                    id="problem-title"
                >
                    {title}
                </h1>
                <span
                    className={`px-3 py-1 text-sm font-medium rounded-full border transition-all duration-200 ${difficultyClasses[difficulty]} self-start sm:self-auto shadow-sm`}
                    role="status"
                    aria-label={`Problem difficulty: ${difficultyLabels[difficulty]}`}
                >
                    {difficulty}
                </span>
            </header>

            {/* Markdown Content with Lazy Loading and Theme Adaptive Styling */}
            <Suspense fallback={<DescriptionSkeleton />}>
                <article 
                    className="markdown-content prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:border-border"
                    aria-labelledby="problem-title"
                >
                    <MarkdownRenderer description={description} />
                </article>
            </Suspense>
        </div>
    );
}
