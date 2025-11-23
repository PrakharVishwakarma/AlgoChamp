// apps/web/app/problems/[slug]/_components/CodeEditorArea.tsx
"use client";

import dynamic from 'next/dynamic';
import { useState, useTransition, useEffect, useCallback } from 'react';
import type { SupportedLanguage } from './ProblemWorkspace';
import {
    Save,
    RotateCcw,
    Maximize2,
    Minimize2,
    Play,
    Check,
    Settings
} from 'lucide-react';
import { Button } from '@repo/ui/button';

import { runCode, type RunResult } from '../../app/problems/[slug]/action';
import { useShowFlashMessage } from '@/context/FlashMessageContext';
import { LANGUAGE_MAPPING } from '@repo/common/language';
import type { SubmissionResultState } from './ProblemWorkspace';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useEditorSettings } from '../../context/EditorSettingsContext';
import { EditorSettingsPanel } from './EditorSettingsPanel';
import { EditorSkeleton } from './EditorSkeleton';
import { EditorErrorBoundary } from './EditorErrorBoundary';
import { Tooltip } from '../common/Tooltip';

const Editor = dynamic(() => import('@monaco-editor/react'), {
    ssr: false,
    loading: () => <EditorSkeleton />,
});

interface CodeEditorAreaProps {
    problemId: string;
    problemSlug: string;
    currentLanguage: SupportedLanguage;
    code: string;
    onLanguageChange: (newLang: SupportedLanguage) => void;
    onCodeChange: (newCode: string) => void;
    onResetCode: () => void;
    setRunResults: (results: RunResult[] | null) => void;
    setRunLoading: (loading: boolean) => void;
    setActiveTab: (tab: 'testCases' | 'runResult' | 'submitResult') => void;
    runLoading: boolean;
    setSubmitLoading: (loading: boolean) => void;
    setSubmissionResult: (result: SubmissionResultState | null) => void;
    submitLoading: boolean;
}

const getMonacoLanguage = (languageKey: string): string => {
    const monacoMapping: Record<string, string> = {
        'cpp': 'cpp',
        'js': 'javascript',
        'rs': 'rust'
    };
    return monacoMapping[languageKey] || 'plaintext';
};

export function CodeEditorArea({
    problemId,
    problemSlug,
    currentLanguage,
    code,
    onLanguageChange,
    onCodeChange,
    onResetCode,
    setRunResults,
    setRunLoading,
    setActiveTab,
    runLoading,
    setSubmitLoading,
    setSubmissionResult,
    submitLoading,
}: CodeEditorAreaProps) {
    const [isResetting, setIsResetting] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [lastSavedCode, setLastSavedCode] = useState(code);
    const [showRestorePrompt, setShowRestorePrompt] = useState(false);
    const [isEditorSettingsPanelOpen, setIsEditorSettingsPanelOpen] = useState(false);
    const [pendingSavedCode, setPendingSavedCode] = useState<string | null>(null);
    const showFlashMessage = useShowFlashMessage();
    const [isRunPending, startRunTransition] = useTransition();
    const [isSubmitPending, startSubmitTransition] = useTransition();
    const editorSettings = useEditorSettings();

    // ✅ Full Screen API Functions (LeetCode-style F11 functionality)
    const handleFullScreenToggle = useCallback(async () => {
        try {
            const isCurrentlyFullScreen = !!(
                document.fullscreenElement ||
                (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
                (document as unknown as { msFullscreenElement?: Element }).msFullscreenElement
            );

            if (isCurrentlyFullScreen) {
                // Exit fullscreen
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
                    await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
                } else if ((document as unknown as { msExitFullscreen?: () => Promise<void> }).msExitFullscreen) {
                    await (document as unknown as { msExitFullscreen: () => Promise<void> }).msExitFullscreen();
                }
                setIsFullScreen(false);
                showFlashMessage('info', '↩️ Exited full screen mode');
            } else {
                // Enter fullscreen
                const element = document.documentElement;
                if (element.requestFullscreen) {
                    await element.requestFullscreen();
                } else if ((element as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
                    await (element as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
                } else if ((element as unknown as { msRequestFullscreen?: () => Promise<void> }).msRequestFullscreen) {
                    await (element as unknown as { msRequestFullscreen: () => Promise<void> }).msRequestFullscreen();
                }
                setIsFullScreen(true);
                showFlashMessage('info', '🔍 Full screen mode enabled (Press Esc or F11 to exit)');
            }
        } catch (error) {
            console.error('Failed to toggle fullscreen:', error);
            showFlashMessage('error', '❌ Failed to toggle full screen mode');
        }
    }, [showFlashMessage]);

    // ✅ Listen for fullscreen change events
    useEffect(() => {
        const handleFullScreenChange = () => {
            const isCurrentlyFullScreen = !!(
                document.fullscreenElement ||
                (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
                (document as unknown as { msFullscreenElement?: Element }).msFullscreenElement
            );
            setIsFullScreen(isCurrentlyFullScreen);
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
        document.addEventListener('msfullscreenchange', handleFullScreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
            document.removeEventListener('msfullscreenchange', handleFullScreenChange);
        };
    }, []);

    // ✅ SINGLE SOURCE OF TRUTH: One localStorage key for auto-save
    const autoSaveKey = `algochamp-code-${problemSlug}-${currentLanguage}`;
    const { saveNow, clearSaved, loadSaved } = useAutoSave({
        key: autoSaveKey,
        value: code,
        delay: 2000, // Auto-save after 2 seconds of inactivity
        enabled: true,
    });

    // ✅ One-time cleanup of old duplicate keys (migration)
    const cleanupOldKeys = useCallback(() => {
        try {
            const oldKey = `editorCode-${problemSlug}-${currentLanguage}`;
            const oldValue = localStorage.getItem(oldKey);

            if (oldValue) {
                // Migrate to new key if it doesn't exist yet
                const newKey = autoSaveKey;
                if (!localStorage.getItem(newKey)) {
                    localStorage.setItem(newKey, oldValue);
                }
                localStorage.removeItem(oldKey);
                console.log(`✅ Migrated ${oldKey} to ${newKey}`);
            }
        } catch (error) {
            console.warn('Failed to cleanup old localStorage keys:', error);
        }
    }, [problemSlug, currentLanguage, autoSaveKey]);

    useEffect(() => {
        cleanupOldKeys();
    }, [cleanupOldKeys]);

    // ✅ Load saved code with user confirmation (prevent unwanted overwrites)
    useEffect(() => {
        const savedCode = loadSaved();
        if (savedCode && savedCode.trim().length > 0 && savedCode !== code) {
            setPendingSavedCode(savedCode);
            setShowRestorePrompt(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [problemSlug, currentLanguage]);

    const handleRestoreCode = () => {
        if (pendingSavedCode) {
            onCodeChange(pendingSavedCode);
            showFlashMessage('success', '💾 Code restored successfully!');
        }
        setShowRestorePrompt(false);
        setPendingSavedCode(null);
    };

    const handleDismissRestore = () => {
        clearSaved();
        setShowRestorePrompt(false);
        setPendingSavedCode(null);
        showFlashMessage('info', '🗑️ Saved code discarded, using fresh template');
    };

    // ✅ Track if code has unsaved changes
    const hasUnsavedChanges = code !== lastSavedCode;

    // ✅ Define handlers before useEffect (to avoid "used before declaration" errors)
    const handleManualSave = useCallback(() => {
        saveNow();
        setLastSavedCode(code);
        showFlashMessage('success', '💾 Code saved successfully!');
    }, [code, saveNow, showFlashMessage]);

    const handleResetClick = () => {
        setIsResetting(true);
        onResetCode();
        clearSaved(); // Clear auto-saved code
        setLastSavedCode('');
        setTimeout(() => setIsResetting(false), 500);
    };

    // ✅ OPTIMIZATION #8: Code validation before run/submit
    const handleRunCode = useCallback(() => {
        // Validate code is not empty
        if (!code.trim()) {
            showFlashMessage('error', '⚠️ Code cannot be empty');
            return;
        }

        startRunTransition(async () => {
            setRunLoading(true);
            setActiveTab('runResult');
            setRunResults(null);

            const result = await runCode({
                problemSlug,
                userCode: code,
                languageId: currentLanguage,
            });

            if (result.success && result.results) {
                setRunResults(result.results);
                showFlashMessage('success', '✅ Code executed successfully!');
            } else {
                setRunResults(result.results || null);
                showFlashMessage('error', result.error || '❌ Failed to run code.');
            }
            setRunLoading(false);
        });
    }, [code, problemSlug, currentLanguage, setRunLoading, setActiveTab, setRunResults, showFlashMessage, startRunTransition]);

    // ✅ OPTIMIZATION #8 & #9: Code validation + Optimistic UI
    const handleSubmitCode = useCallback(() => {
        // Validate code is not empty
        if (!code.trim()) {
            showFlashMessage('error', '⚠️ Code cannot be empty');
            return;
        }

        // Validate code length (max 100KB)
        if (code.length > 100000) {
            showFlashMessage('error', '⚠️ Code is too large (max 100KB)');
            return;
        }

        startSubmitTransition(async () => {
            setSubmitLoading(true);
            setActiveTab('submitResult');

            // ✅ OPTIMIZATION #9: Optimistic UI update
            setSubmissionResult({ id: null, status: 'Submitting...' });

            try {
                const response = await fetch('/api/submission', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        problemId: problemId,
                        languageId: currentLanguage,
                        code: code,
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    const errorMessage = Array.isArray(result.message)
                        ? result.message.map((e: { message: string }) => e.message).join(', ')
                        : result.message || 'Submission failed.';
                    setSubmissionResult({ id: null, status: 'Error', errorMessage });
                    showFlashMessage('error', `❌ ${errorMessage}`);
                } else {
                    setSubmissionResult({ id: result.submissionId, status: 'Pending evaluation...' });
                    showFlashMessage('success', '✅ Code submitted successfully!');

                    // ✅ Clear auto-saved code on successful submit
                    clearSaved();
                    setLastSavedCode(code);
                }

            } catch (error) {
                console.error("Failed to submit code:", error);
                setSubmissionResult({ id: null, status: 'Network Error' });
                showFlashMessage('error', '❌ Network error during submission');
            } finally {
                setSubmitLoading(false);
            }
        });
    }, [code, problemId, currentLanguage, setSubmitLoading, setActiveTab, setSubmissionResult, showFlashMessage, clearSaved, startSubmitTransition]);

    // ✅ OPTIMIZATION #4: Keyboard shortcuts (after all handlers are defined)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + Enter to Run
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!runLoading && !submitLoading) {
                    handleRunCode();
                }
            }
            // Ctrl/Cmd + Shift + Enter to Submit
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
                e.preventDefault();
                if (!runLoading && !submitLoading) {
                    handleSubmitCode();
                }
            }
            // Ctrl/Cmd + S to Save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleManualSave();
            }
            // Escape or F11 to toggle full screen
            if ((e.key === 'Escape' || e.key === 'F11') && isFullScreen) {
                e.preventDefault();
                handleFullScreenToggle();
            }
            // F11 to enter full screen when not in full screen
            if (e.key === 'F11' && !isFullScreen) {
                e.preventDefault();
                handleFullScreenToggle();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleRunCode, handleSubmitCode, handleManualSave, runLoading, submitLoading, isFullScreen, showFlashMessage, handleFullScreenToggle]);

    const selectedMonacoLang = getMonacoLanguage(currentLanguage);

    // ✅ Character/line count
    const lineCount = code.split('\n').length;
    const charCount = code.length;

    return (
        <>
            {/* ✅ Editor Settings Panel (Rendered at root level to escape Monaco's stacking context) */}
            {isEditorSettingsPanelOpen && (
                <EditorSettingsPanel setIsEditorSettingsPanelOpen={setIsEditorSettingsPanelOpen} />
            )}

            {/* ✅ Restore Code Confirmation Modal */}
            {showRestorePrompt && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card/95 backdrop-blur-sm rounded-lg max-w-md w-full border border-border/50 p-6 shadow-2xl">
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            💾 Restore Previous Code?
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            We found code you were working on earlier for this problem and language.
                            Would you like to restore it, or start fresh with the default template?
                        </p>
                        <div className="flex gap-3">
                            <Button
                                onClick={handleRestoreCode}
                                variant="primary"
                                size="sm"
                                className="flex-1"
                            >
                                Restore My Code
                            </Button>
                            <Button
                                onClick={handleDismissRestore}
                                variant="secondary"
                                size="sm"
                                className="flex-1"
                            >
                                Use Fresh Template
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col h-full overflow-hidden rounded-lg bg-card/95 backdrop-blur-sm border border-border/50 shadow-lg transition-all duration-300">
                {/* Editor Controls */}
                <div className="flex items-center justify-between p-3 backdrop-blur-sm border-b bg-muted/30 border-border/30 transition-all duration-200">
                    <div className="flex items-center gap-2">
                        <select
                            value={currentLanguage}
                            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
                            className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-primary/20 transition-all duration-200"
                            aria-label="Select programming language"
                        >
                            {Object.entries(LANGUAGE_MAPPING).map(([key, lang]) => (
                                <option key={key} value={key}>
                                    {lang.name}
                                </option>
                            ))}
                        </select>

                        {/* ✅ Code Stats */}
                        <span className="text-xs text-muted-foreground px-2 hidden sm:inline">
                            {lineCount} lines • {charCount} chars
                        </span>

                        {/* ✅ Unsaved Indicator */}
                        {hasUnsavedChanges && (
                            <span className="text-xs text-warning flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                                Unsaved
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        {/* ✅ Manual Save Button */}
                        <Tooltip content="Save code (Ctrl+S)">
                            <button
                                onClick={handleManualSave}
                                disabled={!hasUnsavedChanges}
                                className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all duration-200 hover:bg-muted/50 rounded-md"
                                aria-label="Save code"
                            >
                                <Save size={18} />
                            </button>
                        </Tooltip>

                        {/* ✅ Settings Button */}
                        <Tooltip content="Editor Settings">
                            <button
                                onClick={() => setIsEditorSettingsPanelOpen(true)}
                                className="p-2 text-muted-foreground hover:text-foreground transition-all duration-200 hover:bg-muted/50 rounded-md"
                                aria-label="Open editor settings"
                            >
                                <Settings size={18} />
                            </button>
                        </Tooltip>

                        {/* ✅ OPTIMIZATION #10: Full Screen Toggle (LeetCode-style F11) */}
                        <Tooltip content={isFullScreen ? 'Exit full screen (Esc/F11)' : 'Enter full screen (F11)'}>
                            <button
                                onClick={handleFullScreenToggle}
                                className={`p-2 transition-all duration-200 rounded-md ${isFullScreen
                                        ? 'text-primary bg-primary/10 hover:bg-primary/20 ring-1 ring-primary/20 shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    }`}
                                aria-label="Toggle full screen"
                            >
                                {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                            </button>
                        </Tooltip>

                        {/* Reset Button */}
                        <Tooltip content="Reset to default code">
                            <button
                                onClick={handleResetClick}
                                disabled={isResetting}
                                className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-all duration-200 hover:bg-muted/50 rounded-md"
                                aria-label="Reset code"
                            >
                                <RotateCcw size={18} />
                            </button>
                        </Tooltip>

                        {/* ✅ NEW: Separator */}
                        <div className="w-px h-6 bg-border/50 mx-2" />

                        {/* ✅ NEW: Run Button */}
                        <Tooltip content="Run code (Ctrl+Enter)" position="bottom-right">
                            <Button
                                onClick={handleRunCode}
                                variant="secondary"
                                size="sm"
                                disabled={runLoading || isRunPending || submitLoading || isSubmitPending}
                                icon={Play}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm mx-2"
                            >
                                <span className="hidden sm:inline">Run</span>
                            </Button>
                        </Tooltip>

                        {/* ✅ NEW: Submit Button */}
                        <Tooltip content="Submit code (Ctrl+Shift+Enter)" position="bottom-right">
                            <Button
                                onClick={handleSubmitCode}
                                variant="primary"
                                size="sm"
                                disabled={runLoading || isRunPending || submitLoading || isSubmitPending}
                                icon={Check}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm"
                            >
                                <span className="hidden sm:inline">Submit</span>
                            </Button>
                        </Tooltip>
                    </div>
                </div>

                {/* Monaco Editor with Error Boundary and Enhanced Scrolling */}
                <div className="flex-grow relative overflow-hidden bg-background">
                    <EditorErrorBoundary>
                            <Editor
                            height="100%"
                            language={selectedMonacoLang}
                            theme={editorSettings.theme}
                            value={code}
                            onChange={(value) => onCodeChange(value || '')}
                            options={{
                                minimap: { enabled: editorSettings.minimap },
                                fontSize: editorSettings.fontSize,
                                tabSize: editorSettings.tabSize,
                                lineNumbers: editorSettings.lineNumbers ? 'on' : 'off',
                                wordWrap: editorSettings.wordWrap ? 'on' : 'off',
                                scrollBeyondLastLine: true,
                                automaticLayout: true,
                                formatOnPaste: editorSettings.autoFormat,
                                formatOnType: editorSettings.autoFormat,
                                smoothScrolling: true,
                                cursorBlinking: 'smooth',
                                cursorSmoothCaretAnimation: 'on',
                                suggestOnTriggerCharacters: true,
                                quickSuggestions: true,
                                // Enhanced scrolling options
                                scrollbar: {
                                    vertical: 'auto',
                                    horizontal: 'auto',
                                    useShadows: true,
                                    verticalHasArrows: false,
                                    horizontalHasArrows: false,
                                    verticalScrollbarSize: 12,
                                    horizontalScrollbarSize: 12,
                                    arrowSize: 30,
                                },
                                overviewRulerBorder: false,
                                hideCursorInOverviewRuler: true,
                            }}
                            />
                    </EditorErrorBoundary>
                </div>
            </div>
        </>
    );
}