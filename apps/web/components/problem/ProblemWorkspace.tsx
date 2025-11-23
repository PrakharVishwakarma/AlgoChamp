// /apps/web/app/problems/[slug]/_components/ProblemWorkspace.tsx
'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ProblemDescription } from './ProblemDescription';
import { CodeEditorArea } from './CodeEditorArea';
import { OutputConsole } from './OutputConsole';
import { Difficulty } from '@prisma/client';
import { RunResult } from '../../app/problems/[slug]/action';
import { LANGUAGE_MAPPING } from '@repo/common/language';
import { SubmissionStatus } from "@prisma/client";
import { SubmissionsList } from './SubmissionsList';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { EditorSettingsProvider } from '../../context/EditorSettingsContext';
import axios from 'axios';

export type TabName = 'testCases' | 'runResult' | 'submitResult';

export interface ProblemData {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    difficulty: Difficulty;
    boilerplates: Record<string, string>;
}

export interface SubmissionResultState {
    id: string | null;
    status: SubmissionStatus | "Submitting..." | "Error" | "Network Error" | "Pending evaluation..." | "Timeout";
    time?: number | null;
    memory?: number | null;
    errorMessage?: string;
    canRetry?: boolean; // ✅ NEW: Flag to show retry button
}

export type SupportedLanguage = 'cpp' | 'js' | 'rs';

const getInitialLanguage = (slug: string): SupportedLanguage => {
    if (typeof window !== 'undefined') {
        const lastLang = localStorage.getItem(`editorLanguage-${slug}`);
        if (lastLang === 'cpp' || lastLang === 'js' || lastLang === 'rs') {
            return lastLang;
        }
    }
    return 'cpp';
};

export const getInitialCode = (lang: SupportedLanguage, boilerplates: Record<string, string>): string => {
    const mappedKey = LANGUAGE_MAPPING[lang]?.internal;
    if (mappedKey && mappedKey in boilerplates) {
        return boilerplates[mappedKey] || '';
    }
    return '';
};

export const FINAL_SUBMISSION_STATES: (SubmissionStatus | string)[] = [
    SubmissionStatus.AC,
    SubmissionStatus.REJECTED,
    SubmissionStatus.COMPILATION_ERROR,
    SubmissionStatus.TLE,
    "Error",
    "Network Erro   r",
    "Timeout", // ✅ NEW: Timeout is final state
];

// ✅ NEW: Polling configuration
export const POLLING_CONFIG = {
    INTERVAL_MS: 2000,        // Poll every 2 seconds
    MAX_DURATION_MS: 20000,   // Stop after 20 seconds
    MAX_ATTEMPTS: 10          // 20s / 2s = 10 attempts
};

export function ProblemWorkspace({ problemData }: { problemData: ProblemData }) {
    const { id: problemId, slug, boilerplates } = problemData;

    const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() => getInitialLanguage(slug));
    const [editorCode, setEditorCode] = useState<string>(() => getInitialCode(currentLanguage, boilerplates));

    const [activeTab, setActiveTab] = useState<TabName>('testCases');

    const [runResults, setRunResults] = useState<RunResult[] | null>(null);
    const [runLoading, setRunLoading] = useState<boolean>(false);

    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [submissionResult, setSubmissionResult] = useState<SubmissionResultState | null>(null);

    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const pollingStartTimeRef = useRef<number | null>(null);

    const [leftPanelTab, setLeftPanelTab] = useState<'description' | 'submissions'>('description');

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

    // Save Language preference 
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
            {/* ✅ Main Horizontal PanelGroup: Description/Submissions | Editor/Console */}
            <PanelGroup direction="horizontal" className="h-full w-full">
                {/* ===== LEFT PANEL: Description & Submissions ===== */}
                <Panel 
                    defaultSize={40} 
                    minSize={25} 
                    maxSize={60}
                    className="flex flex-col"
                >
                    <div className="h-full flex flex-col bg-card/95 backdrop-blur-sm border-r border-border/50 shadow-lg">
                        {/* Tab Navigation */}
                        <div className="flex border-b border-border/30 bg-muted/30 backdrop-blur-sm">
                            <button
                                onClick={() => setLeftPanelTab('description')}
                                className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 relative ${
                                    leftPanelTab === 'description'
                                        ? 'text-foreground bg-card/90 shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                }`}
                            >
                                {leftPanelTab === 'description' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-t-full" />
                                )}
                                <span className="flex items-center justify-center gap-2">
                                    📝 Description
                                </span>
                            </button>
                            <button
                                onClick={() => setLeftPanelTab('submissions')}
                                className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 relative ${
                                    leftPanelTab === 'submissions'
                                        ? 'text-foreground bg-card/90 shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                }`}
                            >
                                {leftPanelTab === 'submissions' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-t-full" />
                                )}
                                <span className="flex items-center justify-center gap-2">
                                    📊 My Submissions
                                </span>
                            </button>
                        </div>

                        {/* Content Area with Enhanced Scrollbar */}
                        <div className="flex-1 overflow-hidden">
                            <div className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar-enhanced">
                                {leftPanelTab === 'description' && (
                                    <div className="p-4">
                                        <ProblemDescription
                                            title={problemData.title}
                                            difficulty={problemData.difficulty}
                                            description={problemData.description || "No description available."}
                                        />
                                    </div>
                                )}
                                {leftPanelTab === 'submissions' && (
                                    <div className="h-full">
                                        <SubmissionsList problemId={problemData.id} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Panel>

                {/* ===== RESIZE HANDLE (Horizontal) ===== */}
                <PanelResizeHandle className="w-2 bg-border/50 hover:bg-primary/50 active:bg-primary transition-all duration-200 cursor-col-resize relative group">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-12 bg-muted-foreground/40 rounded-full group-hover:bg-primary/70 group-active:bg-primary transition-all duration-200" />
                </PanelResizeHandle>

                {/* ===== RIGHT PANEL: Vertical Split (Editor | Console) ===== */}
                <Panel defaultSize={60} minSize={40}>
                    <PanelGroup direction="vertical">
                        {/* ===== TOP: Code Editor ===== */}
                        <Panel 
                            defaultSize={60} 
                            minSize={30}
                            className="flex flex-col"
                        >
                            <div className="h-full flex flex-col bg-card/95 backdrop-blur-sm border-t border-r border-border/50 overflow-hidden shadow-lg">
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
                            </div>
                        </Panel>

                        {/* ===== RESIZE HANDLE (Vertical) ===== */}
                        <PanelResizeHandle className="h-2 bg-border/50 hover:bg-primary/50 active:bg-primary transition-all duration-200 cursor-row-resize relative group">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-12 bg-muted-foreground/40 rounded-full group-hover:bg-primary/70 group-active:bg-primary transition-all duration-200" />
                        </PanelResizeHandle>

                        {/* ===== BOTTOM: Console Output ===== */}
                        <Panel 
                            defaultSize={40} 
                            minSize={20}
                            className="flex flex-col"
                        >
                            <div className="h-full flex flex-col bg-card/95 backdrop-blur-sm border-r border-b border-border/50 overflow-hidden shadow-lg">
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
                            </div>
                        </Panel>
                    </PanelGroup>
                </Panel>
            </PanelGroup>

            {/* ✅ Enhanced Theme-Adaptive Custom Scrollbar Styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar,
                .custom-scrollbar-enhanced::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track,
                .custom-scrollbar-enhanced::-webkit-scrollbar-track {
                    background: hsl(var(--muted) / 0.2);
                    border-radius: 4px;
                    margin: 2px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb,
                .custom-scrollbar-enhanced::-webkit-scrollbar-thumb {
                    background: hsl(var(--muted-foreground) / 0.3);
                    border-radius: 4px;
                    transition: all 0.2s ease;
                    border: 1px solid hsl(var(--border) / 0.2);
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover,
                .custom-scrollbar-enhanced::-webkit-scrollbar-thumb:hover {
                    background: hsl(var(--primary) / 0.6);
                    border-color: hsl(var(--primary) / 0.4);
                    transform: scaleX(1.1);
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:active,
                .custom-scrollbar-enhanced::-webkit-scrollbar-thumb:active {
                    background: hsl(var(--primary) / 0.8);
                    border-color: hsl(var(--primary) / 0.6);
                }
                
                .custom-scrollbar-enhanced::-webkit-scrollbar-corner {
                    background: hsl(var(--muted) / 0.2);
                }
                
                /* For Firefox */
                .custom-scrollbar,
                .custom-scrollbar-enhanced {
                    scrollbar-width: thin;
                    scrollbar-color: hsl(var(--muted-foreground) / 0.3) hsl(var(--muted) / 0.2);
                }
                
                /* Smooth scrolling behavior */
                .custom-scrollbar,
                .custom-scrollbar-enhanced {
                    scroll-behavior: smooth;
                }
            `}</style>
        </EditorSettingsProvider>
    );
}