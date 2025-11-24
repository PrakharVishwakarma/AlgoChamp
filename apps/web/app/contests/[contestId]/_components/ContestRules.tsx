// apps/web/app/contests/[contestId]/_components/ContestRules.tsx

'use client';

import { useState } from 'react';
import { AlertTriangle, Shield, Code, Clock, Users, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

export function ContestRules() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="rounded-lg border bg-card shadow-sm">
            {/* Header - Always Visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-muted/50"
            >
                <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-primary" />
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Contest Rules & Guidelines</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Please read carefully to ensure fair participation
                        </p>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t px-6 py-6 space-y-6">
                    {/* Contest Violations */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-foreground mb-3">Prohibited Actions</h3>
                                <ul className="space-y-2.5 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 mt-1">•</span>
                                        <span>Using multiple accounts to submit solutions for the same contest</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 mt-1">•</span>
                                        <span>Submitting plagiarized or similar code across multiple accounts</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 mt-1">•</span>
                                        <span>Using AI code generation tools (ChatGPT, GitHub Copilot, etc.) or external assistance during the contest</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 mt-1">•</span>
                                        <span>Sharing or discussing solutions publicly before the contest ends</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 mt-1">•</span>
                                        <span>Creating disturbances that interrupt other participants</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Penalties */}
                    <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20 p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">Violation Penalties</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-start gap-2 text-red-800 dark:text-red-300">
                                        <span className="font-bold">1st Violation:</span>
                                        <span>Contest score reset to zero, 1-month contest ban</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-red-800 dark:text-red-300">
                                        <span className="font-bold">2nd Violation:</span>
                                        <span>Permanent account deactivation without appeal</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Allowed Practices */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Code className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-foreground mb-3">Acceptable Practices</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium text-foreground mb-1">Hardcoding Test Cases</p>
                                        <p className="text-sm text-muted-foreground">
                                            Using if-else statements to hardcode test cases is allowed. If your submission passes all final test cases, it will be accepted.
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground mb-1">Precomputed Results</p>
                                        <p className="text-sm text-muted-foreground">
                                            You may submit precomputed results. However, you must include both the solution code and precomputation code in your submission.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Technical Issues */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-foreground mb-3">Technical Issues & Fairness</h3>
                                <ul className="space-y-2.5 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-1">•</span>
                                        <span>If weak test cases are discovered, we will add additional test cases and rejudge all accepted submissions</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-1">•</span>
                                        <span>If incorrect test cases cause wrong judgments, the contest may be marked as unrated if more than 10% of submissions are affected</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-1">•</span>
                                        <span>Site downtime of 15+ minutes will result in the contest being unrated</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-1">•</span>
                                        <span>Always submit the code that is correct to the best of your knowledge</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Fair Play */}
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                        <div className="flex items-start gap-3">
                            <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-foreground mb-2">Our Commitment to Fair Play</h3>
                                <p className="text-sm text-muted-foreground">
                                    We are committed to maintaining a fair and competitive environment for all participants. 
                                    Any suspected violations will be thoroughly investigated. AlgoChamp&apos;s decision on rule violations is final and will be announced in the contest discussion.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Closing Note */}
                    <div className="mt-6 rounded-lg bg-muted/50 p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            By participating in this contest, you agree to abide by these rules and guidelines.
                            <br />
                            <span className="font-medium text-foreground">Thank you for helping us maintain a fair and enjoyable contest experience! 🎯</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
