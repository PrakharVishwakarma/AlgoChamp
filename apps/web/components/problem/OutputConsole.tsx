// apps/web/app/problems/[slug]/_components/OutputConsole.tsx

"use client";

import type { RunResult } from "../../app/problems/[slug]/action"; // Import RunResult type
import { CheckCircle2, XCircle, AlertTriangle, Clock, ServerCrash, Loader2, MinusCircle, BrainCircuit } from "lucide-react"; // Loading spinner icon
import { useState } from 'react';
import { SubmissionStatus } from '@prisma/client';

import { TabName } from "./ProblemWorkspace";
import { SubmissionResultState } from "./ProblemWorkspace";

interface OutputConsoleProps {
    publicTestCases: { input: string; output: string | null }[]; // Pass public cases
    runResults: RunResult[] | null;
    runLoading: boolean;
    submitResult: SubmissionResultState | null;
    submitLoading: boolean; // Placeholder
    activeTab: TabName;
    setActiveTab: (tab: TabName) => void;
    onRetrySubmission?: () => void; // ✅ NEW: Retry callback for timeout/error cases
}

// Helper function/map for status display
const statusDisplayMap: Record<SubmissionStatus | string, { icon: React.ReactNode, textClass: string, label: string }> = {
    [SubmissionStatus.AC]: { icon: <CheckCircle2 className="text-green-500" />, textClass: 'text-green-400', label: 'Accepted' },
    [SubmissionStatus.REJECTED]: { icon: <XCircle className="text-red-500" />, textClass: 'text-red-400', label: 'Rejected' }, // Can mean WA, RE etc.
    [SubmissionStatus.COMPILATION_ERROR]: { icon: <AlertTriangle className="text-yellow-500" />, textClass: 'text-yellow-400', label: 'Compilation Error' },
    [SubmissionStatus.TLE]: { icon: <Clock className="text-orange-500" />, textClass: 'text-orange-400', label: 'Time Limit Exceeded' },
    [SubmissionStatus.PENDING]: { icon: <Loader2 className="text-slate-500 animate-spin" />, textClass: 'text-slate-400', label: 'Pending...' },
    "Submitting...": { icon: <Loader2 className="text-slate-500 animate-spin" />, textClass: 'text-slate-400', label: 'Submitting...' },
    "Pending evaluation...": { icon: <Loader2 className="text-yellow-500 animate-spin" />, textClass: 'text-yellow-400', label: 'Evaluating...' },
    "Error": { icon: <ServerCrash className="text-red-600" />, textClass: 'text-red-500', label: 'Submission Error' },
    "Network Error": { icon: <ServerCrash className="text-red-600" />, textClass: 'text-red-500', label: 'Network Error' },
    // Add more specific statuses if your webhook sends them (e.g., MEMORY_LIMIT_EXCEEDED)
};

export function OutputConsole({
    publicTestCases,
    runResults,
    runLoading,
    submitResult,
    submitLoading,
    activeTab,
    setActiveTab,
    onRetrySubmission, // ✅ NEW
}: OutputConsoleProps) {
    // ✅ NEW: State for selected testcase in horizontal tabs
    const [selectedTestCase, setSelectedTestCase] = useState<number>(0);

    const renderRunResults = () => {
        if (runLoading) {
            return (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="animate-spin mr-2" size={20} /> Running...
                </div>
            );
        }
        if (!runResults) {
            return <div className="p-4 text-muted-foreground text-sm">Click Run to test your code against example cases.</div>;
        }
        if (runResults.length === 0) {
            return <div className="p-4 text-muted-foreground text-sm">No public test cases configured or execution failed.</div>;
        }

        // ✅ NEW: Horizontal Testcase Tabs Implementation
        const selectedResult = runResults[selectedTestCase] || runResults[0];
        if (!selectedResult) {
            return <div className="p-4 text-muted-foreground text-sm">No test result available.</div>;
        }

        return (
            <div className="flex flex-col h-full">
                {/* ✅ Horizontal Testcase Bar */}
                <div className="flex border-b border-border/50 bg-muted/30 backdrop-blur-sm overflow-x-auto scrollbar-thin">
                    {runResults.map((result, index) => {
                        const isSelected = index === selectedTestCase;
                        const statusColor = result.status === 'Passed' 
                            ? 'text-green-500 border-green-500' 
                            : result.status === 'Failed' 
                            ? 'text-red-500 border-red-500' 
                            : 'text-yellow-500 border-yellow-500';
                        
                        return (
                            <button
                                key={index}
                                onClick={() => setSelectedTestCase(index)}
                                className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                                    isSelected
                                        ? `${statusColor} bg-card/50`
                                        : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    {result.status === 'Passed' && <CheckCircle2 size={16} className="text-green-500" />}
                                    {result.status === 'Failed' && <XCircle size={16} className="text-red-500" />}
                                    {result.status !== 'Passed' && result.status !== 'Failed' && <AlertTriangle size={16} className="text-yellow-500" />}
                                    Test Case {index + 1}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* ✅ Selected Testcase Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar-enhanced p-4">
                    <div className="space-y-4">
                        {/* Status Header */}
                        <div className={`p-3 rounded-lg border ${
                            selectedResult.status === 'Passed' 
                                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                                : selectedResult.status === 'Failed'
                                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                        }`}>
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">Test Case {selectedTestCase + 1}</span>
                                <span className="font-medium">{selectedResult.status}</span>
                            </div>
                            {(selectedResult.time !== null || selectedResult.memory !== null) && (
                                <div className="text-sm mt-1 opacity-80">
                                    {selectedResult.time && `⏱️ ${selectedResult.time.toFixed(3)}s`}
                                    {selectedResult.time && selectedResult.memory && " • "}
                                    {selectedResult.memory && `💾 ${selectedResult.memory} KB`}
                                </div>
                            )}
                        </div>

                        {/* Input/Output Sections */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">📥 Input:</label>
                                <pre className="p-3 rounded-lg bg-muted/50 border border-border/50 text-sm whitespace-pre-wrap font-mono">
                                    {selectedResult.input || '(empty)'}
                                </pre>
                            </div>
                            
                            {selectedResult.expectedOutput !== null && (
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-2">✅ Expected Output:</label>
                                    <pre className="p-3 rounded-lg bg-muted/50 border border-border/50 text-sm whitespace-pre-wrap font-mono">
                                        {selectedResult.expectedOutput || '(empty)'}
                                    </pre>
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">📤 Your Output:</label>
                                <pre className={`p-3 rounded-lg border text-sm whitespace-pre-wrap font-mono ${
                                    selectedResult.actualOutput === null 
                                        ? 'text-muted-foreground italic bg-muted/30 border-border/30' 
                                        : 'bg-muted/50 border-border/50'
                                }`}>
                                    {selectedResult.actualOutput ?? '(no output)'}
                                </pre>
                            </div>
                            
                            {selectedResult.errorMessage && (
                                <div>
                                    <label className="block text-sm font-semibold text-red-400 mb-2">❌ Error:</label>
                                    <pre className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm whitespace-pre-wrap font-mono">
                                        {selectedResult.errorMessage}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderSubmitResult = () => {
        // Show loading spinner first if submit API call is in progress
        if (submitLoading) {
            return (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="animate-spin mr-2" size={20} /> Submitting...
                </div>
            );
        }
        if (!submitResult || !submitResult.status) { // Check if we have status info
            return <div className="p-4 text-muted-foreground text-sm">Click &quot;Submit&quot; to run your code against all test cases.</div>;
        }

        const displayInfo = statusDisplayMap[submitResult.status] || {
            icon: <MinusCircle className="text-muted-foreground" />,
            textClass: 'text-muted-foreground',
            label: submitResult.status // Fallback to raw status
        };

        return (
            <div className="p-4 space-y-4">
                {/* Status Display */}
                <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-foreground">Submission Status</span>
                        <div className={`flex items-center gap-2 font-medium ${displayInfo.textClass}`}>
                            {displayInfo.icon}
                            <span>{displayInfo.label}</span>
                        </div>
                    </div>

                    {/* Show Time and Memory if available and status is AC */}
                    {submitResult.status === SubmissionStatus.AC && (submitResult.time !== null || submitResult.memory !== null) && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border/30">
                            {submitResult.time !== null && submitResult.time !== undefined && (
                                <div className="flex items-center gap-1">
                                    <Clock size={14} />
                                    <span>⏱️ {submitResult.time.toFixed(3)}s</span>
                                </div>
                            )}
                            {submitResult.memory !== null && (
                                <div className="flex items-center gap-1">
                                    <BrainCircuit size={14} />
                                    <span>💾 {submitResult.memory} KB</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Display specific error messages */}
                {(submitResult.status === 'Error' || submitResult.status === 'Network Error' || submitResult.status === 'Timeout' || submitResult.status === SubmissionStatus.COMPILATION_ERROR) && submitResult.errorMessage && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                        <label className="block text-sm font-semibold text-red-400 mb-2">❌ Error Details:</label>
                        <pre className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 whitespace-pre-wrap text-sm font-mono">
                            {submitResult.errorMessage}
                        </pre>
                    </div>
                )}

                {/* ✅ Retry Button for timeout/error cases */}
                {submitResult.canRetry && onRetrySubmission && (
                    <div className="flex justify-center">
                        <button
                            onClick={onRetrySubmission}
                            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-sm rounded-lg transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            🔄 Try Again
                        </button>
                    </div>
                )}

                {/* ✅ Timeout Help Text */}
                {submitResult.status === 'Timeout' && (
                    <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg text-sm">
                        <p className="font-medium mb-2 text-warning">⏱️ Evaluation is taking longer than expected</p>
                        <p className="text-muted-foreground text-sm">Your submission might still be processing. Check the <span className="text-primary font-medium">&quot;My Submissions&quot;</span> tab for updates, or try submitting again.</p>
                    </div>
                )}

                {/* Optionally show Submission ID */}
                {submitResult.id && (
                    <div className="text-xs text-muted-foreground pt-2 font-mono">
                        Submission ID: {submitResult.id}
                    </div>
                )}

                {/* TODO: Add link/button to view detailed test case results if status is REJECTED/TLE etc. */}
            </div>
        );
    };

    const renderTestCases = () => {
        if (publicTestCases.length === 0) {
            return <div className="p-4 text-muted-foreground text-sm">No example test cases provided for this problem.</div>;
        }
        return (
            <div className="space-y-4 p-4 overflow-y-auto custom-scrollbar-enhanced">
                {publicTestCases.map((tc, index) => (
                    <div key={index} className="border border-border/50 rounded-lg overflow-hidden bg-card/50 backdrop-blur-sm">
                        <div className="px-4 py-3 text-sm font-semibold bg-muted/50 border-b border-border/30 text-foreground">
                            📝 Test Case #{index + 1}
                        </div>
                        <div className="p-4 space-y-3">
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">📥 Input:</label>
                                <pre className="p-3 rounded-lg bg-muted/50 border border-border/50 text-sm whitespace-pre-wrap font-mono">
                                    {tc.input || '(empty)'}
                                </pre>
                            </div>
                            {tc.output !== null && (
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-2">✅ Expected Output:</label>
                                    <pre className="p-3 rounded-lg bg-muted/50 border border-border/50 text-sm whitespace-pre-wrap font-mono">
                                        {tc.output || '(empty)'}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col flex-grow min-h-[200px] rounded-lg bg-card/95 backdrop-blur-sm border border-border/50 overflow-hidden shadow-lg">
            {/* Enhanced Tabs */}
            <div className="flex border-b border-border/30 bg-muted/30 backdrop-blur-sm">
                {(['testCases', 'runResult', 'submitResult'] as TabName[]).map(tab => {
                    const tabLabels = {
                        testCases: '📝 Test Cases',
                        runResult: '🏃 Run Result', 
                        submitResult: '🚀 Submit Result'
                    };
                    
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-3 text-sm font-medium transition-all duration-200 relative ${
                                activeTab === tab
                                    ? 'text-foreground bg-card/90 shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            }`}
                        >
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-t-full" />
                            )}
                            {tabLabels[tab]}
                        </button>
                    );
                })}
            </div>

            {/* Content with Enhanced Scrolling */}
            <div className="flex-grow overflow-hidden">
                <div className="h-full overflow-auto custom-scrollbar-enhanced">
                    {activeTab === 'testCases' && renderTestCases()}
                    {activeTab === 'runResult' && renderRunResults()}
                    {activeTab === 'submitResult' && renderSubmitResult()}
                </div>
            </div>
        </div>
    );
}