// apps/web/app/contests/[contestId]/problem/[slug]/_components/ContestProblemWorkspace.tsx

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ProblemDescription } from '@/components/problem/ProblemDescription';
import { CodeEditorArea } from '@/components/problem/CodeEditorArea';
import { OutputConsole } from '@/components/problem/OutputConsole';
import { RunResult } from '../../../../../problems/[slug]/action';
import { SubmissionResultState, SupportedLanguage, TabName } from '@/components/problem/ProblemWorkspace';
import { LANGUAGE_MAPPING } from '@repo/common/language';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { EditorSettingsProvider } from '@/context/EditorSettingsContext';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getInitialCode, ProblemData, FINAL_SUBMISSION_STATES, POLLING_CONFIG } from '@/components/problem/ProblemWorkspace';
import { ContestHeader } from './ContestHeader';

interface ContestData {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    isLive: boolean;
    isVirtualMode: boolean;
    problemLabel: string;
    points: number;
    solvedCount: number;
}

interface ContestProblemWorkspaceProps {
    problemData: ProblemData;
    contestData: ContestData;
    userId: string;
}

const getInitialLanguage = (slug: string, contestId: string): SupportedLanguage => {
    if (typeof window !== 'undefined') {
        const lastLang = localStorage.getItem(`editorLanguage-${contestId}-${slug}`);
        if (lastLang === 'cpp' || lastLang === 'js' || lastLang === 'rs') {
            return lastLang;
        }
    }
    return 'cpp';
};

export function ContestProblemWorkspace({ problemData, contestData }: ContestProblemWorkspaceProps) {
    const router = useRouter();
    const { id: problemId, slug, boilerplates } = problemData;
    const { id: contestId, isLive, isVirtualMode } = contestData;

    const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() =>
        getInitialLanguage(slug, contestId)
    );
    const [editorCode, setEditorCode] = useState<string>(() =>
        getInitialCode(currentLanguage, boilerplates)
    );

    const [activeTab, setActiveTab] = useState<TabName>('testCases');

    const [runResults, setRunResults] = useState<RunResult[] | null>(null);
    const [runLoading, setRunLoading] = useState<boolean>(false);

    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [submissionResult, setSubmissionResult] = useState<SubmissionResultState | null>(null);

    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const pollingStartTimeRef = useRef<number | null>(null);

    const [showNavigationWarning, setShowNavigationWarning] = useState(false);

    // ✅ NEW: Retry handler for timeout/error cases
    const handleRetrySubmission = useCallback(() => {
        console.log("🔄 Retrying submission...");
        setSubmissionResult(null);
        pollingStartTimeRef.current = null;
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    }, []);

    // Save language preference per contest
    useEffect(() => {
        localStorage.setItem(`editorLanguage-${contestId}-${slug}`, currentLanguage);
    }, [currentLanguage, slug, contestId]);

    useEffect(() => {
        localStorage.setItem(`editorLanguage-${slug}`, currentLanguage);
    }, [currentLanguage, slug]);

    // ✅ NEW: Enhanced polling with timeout
    useEffect(() => {
        const fetchStatus = async (id: string) => {
            try {
                // ✅ Check if polling has exceeded timeout
                const now = Date.now();
                const elapsed = pollingStartTimeRef.current ? now - pollingStartTimeRef.current : 0;

                if (elapsed > POLLING_CONFIG.MAX_DURATION_MS) {
                    console.warn(`⏱️ Polling timeout after ${elapsed}ms for submission ${id}`);

                    setSubmissionResult(prev => ({
                        ...(prev ?? { id, status: "Timeout" }),
                        status: "Timeout",
                        errorMessage: "Submission is taking longer than expected. Please check 'My Submissions' or try again.",
                        canRetry: true
                    }));

                    // Stop polling
                    if (pollingIntervalRef.current) {
                        clearInterval(pollingIntervalRef.current);
                        pollingIntervalRef.current = null;
                        pollingStartTimeRef.current = null;
                    }
                    return;
                }

                const response = await axios.get(`/api/submission?submissionId=${id}`);

                if (response.status !== 200) {
                    throw new Error(`Failed to fetch status: ${response.statusText}`);
                }

                const data = response.data;
                const fetchedSubmission = data.submission;

                if (fetchedSubmission) {
                    setSubmissionResult(prev => ({
                        ...(prev ?? { id, status: fetchedSubmission.status }),
                        status: fetchedSubmission.status,
                        time: fetchedSubmission.time,
                        memory: fetchedSubmission.memory,
                        canRetry: false // ✅ Clear retry flag on success
                    }));

                    // Stop polling if final state
                    if (FINAL_SUBMISSION_STATES.includes(fetchedSubmission.status)) {
                        if (pollingIntervalRef.current) {
                            clearInterval(pollingIntervalRef.current);
                            pollingIntervalRef.current = null;
                            pollingStartTimeRef.current = null;
                            console.log(`✅ Polling stopped (final state: ${fetchedSubmission.status})`);
                        }
                    }
                }
            } catch (error) {
                console.error("❌ Polling error:", error);

                setSubmissionResult(prev => ({
                    ...(prev ?? { id, status: "Error" }),
                    status: "Network Error",
                    errorMessage: (error as Error).message,
                    canRetry: true
                }));

                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                    pollingIntervalRef.current = null;
                    pollingStartTimeRef.current = null;
                }
            }
        };

        // Clear existing interval
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }

        // Check if should start polling
        const isPending = submissionResult?.id && !FINAL_SUBMISSION_STATES.includes(submissionResult.status);

        if (isPending) {
            const submissionId = submissionResult.id!;

            // ✅ Initialize polling start time
            if (!pollingStartTimeRef.current) {
                pollingStartTimeRef.current = Date.now();
                console.log(`🚀 Starting polling for submission ${submissionId}`);
            }

            // Initial fetch
            fetchStatus(submissionId);

            // Set interval
            pollingIntervalRef.current = setInterval(() => {
                fetchStatus(submissionId);
            }, POLLING_CONFIG.INTERVAL_MS);
        }

        // Cleanup
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [submissionResult?.id, submissionResult?.status]);



    // Navigation warning for live contests
    useEffect(() => {
        if (!isLive || isVirtualMode) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            return '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isLive, isVirtualMode]);

    const handleLanguageChange = useCallback((newLang: SupportedLanguage) => {
        setCurrentLanguage(newLang);
        setEditorCode(getInitialCode(newLang, boilerplates));
    }, [boilerplates]);

    const handleResetCode = useCallback(() => {
        const mappedKey = LANGUAGE_MAPPING[currentLanguage]?.internal;
        if (mappedKey && mappedKey in boilerplates) {
            setEditorCode(boilerplates[mappedKey] || '');
        }
    }, [boilerplates, currentLanguage]);

    const publicTestCases = useMemo(() => {
        const exampleFromDescription = extractExamplesFromDescription(problemData.description || '');
        return exampleFromDescription.slice(0, 3);
    }, [problemData.description]);

    function extractExamplesFromDescription(description: string): { input: string; output: string | null }[] {
        const inputs = description.match(/```input\n([\s\S]*?)```/g)?.map(s => s.replace(/```input\n|```/g, '').trim()) || [];
        const outputs = description.match(/```output\n([\s\S]*?)```/g)?.map(s => s.replace(/```output\n|```/g, '').trim()) || [];
        return inputs.map((input, i) => ({ input, output: outputs[i] || null }));
    }

    return (
        <EditorSettingsProvider>
            <div className="h-full flex flex-col">
                {/* Contest Header */}
                <ContestHeader
                    contestId={contestId}
                    contestTitle={contestData.title}
                    problemLabel={contestData.problemLabel}
                    points={contestData.points}
                    endTime={contestData.endTime}
                    isLive={isLive}
                    isVirtualMode={isVirtualMode}
                />

                {/* Main Workspace */}
                <PanelGroup direction="horizontal" className="flex-1">
                    {/* Left Panel - Problem Description */}
                    <Panel defaultSize={35} minSize={25}>
                        <div className="h-full overflow-y-auto">
                            <ProblemDescription
                                title={problemData.title}
                                description={problemData.description || ''}
                                difficulty={problemData.difficulty}
                            />
                        </div>
                    </Panel>

                    <PanelResizeHandle className="w-2 bg-border hover:bg-primary/20 transition-colors" />

                    {/* Right Panel - Code Editor + Console */}
                    <Panel defaultSize={65} minSize={35}>
                        <PanelGroup direction="vertical">
                            {/* Code Editor */}
                            <Panel defaultSize={60} minSize={30}>
                                <CodeEditorArea
                                    problemId={problemId}
                                    problemSlug={slug}
                                    currentLanguage={currentLanguage}
                                    code={editorCode}
                                    onLanguageChange={handleLanguageChange}
                                    onCodeChange={setEditorCode}
                                    onResetCode={handleResetCode}
                                    setRunResults={setRunResults}
                                    setRunLoading={setRunLoading}
                                    setActiveTab={setActiveTab}
                                    runLoading={runLoading}
                                    setSubmitLoading={setSubmitLoading}
                                    setSubmissionResult={setSubmissionResult} 
                                    submitLoading={submitLoading}
                                />
                            </Panel>

                            <PanelResizeHandle className="h-2 bg-border hover:bg-primary/20 transition-colors" />

                            {/* Output Console */}
                            <Panel defaultSize={40} minSize={20}>
                                <OutputConsole
                                    publicTestCases={publicTestCases}
                                    runResults={runResults} 
                                    runLoading={runLoading}
                                    submitResult={submissionResult}
                                    submitLoading={submitLoading}
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                    onRetrySubmission={handleRetrySubmission}
                                />
                            </Panel>
                        </PanelGroup>
                    </Panel>
                </PanelGroup>

                {/* Navigation Warning Modal */}
                {showNavigationWarning && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="w-full max-w-md rounded-lg border bg-card p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                                <h3 className="text-lg font-semibold">Leave Contest?</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-6">
                                You are currently in an active contest. Leaving this page may affect your submission timing.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowNavigationWarning(false)}
                                    className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
                                >
                                    Stay
                                </button>
                                <button
                                    onClick={() => router.push(`/contests/${contestId}`)}
                                    className="flex-1 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Leave
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </EditorSettingsProvider>
    );
}
